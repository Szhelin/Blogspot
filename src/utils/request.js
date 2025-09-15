import axios from 'axios'
import store from '../store'
import { message as $message } from '@/libs'

// 存放正在进行的请求
const pendingMap = new Map()

// 简单内存缓存
const cacheMap = new Map()

// 消息去重
const messageCache = new Set()

// 辅助：稳定 stringify（对对象按键排序，保证相同参数顺序一致）
function stableStringify(obj) {
  if (obj === null || obj === undefined) return ''
  if (typeof obj !== 'object') return String(obj)
  if (Array.isArray(obj)) return JSON.stringify(obj.map(stableStringify))
  const allKeys = Object.keys(obj).sort()
  const sorted = {}
  for (const k of allKeys) sorted[k] = obj[k]
  return JSON.stringify(sorted)
}

// 生成请求唯一 key
function getRequestKey(config) {
  const method = (config.method || 'get').toLowerCase()
  const url = config.url || ''
  const params = stableStringify(config.params || {})
  const data = stableStringify(config.data || {})
  return [method, url, params, data].join('&')
}

// 取消并移除已存在的重复请求
function removePending(config) {
  const key = getRequestKey(config)
  if (pendingMap.has(key)) {
    const cancel = pendingMap.get(key)
    cancel && cancel('取消重复请求')
    pendingMap.delete(key)
  }
}

// 添加当前请求到 pendingMap
function addPending(config) {
  const key = getRequestKey(config)
  config.cancelToken = new axios.CancelToken((c) => {
    if (!pendingMap.has(key)) pendingMap.set(key, c)
  })
}

// 控制重复提示：短时间内同样消息只显示一次
function debounceMessage(type, msg, delay = 3000) {
  if (!msg) return
  const key = `${type}:${msg}`
  if (messageCache.has(key)) return
  messageCache.add(key)
  $message(type, msg)
  setTimeout(() => messageCache.delete(key), delay)
}

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    removePending(config)
    addPending(config)

    config.headers = config.headers || {}
    config.headers.icode = 'your-icode'

    try {
      const token = store.getters && store.getters.token
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch (e) {}

    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    try {
      removePending(response.config)
    } catch (e) {}

    const res = response.data

    if (res && typeof res === 'object' && 'success' in res) {
      if (res.success) {
        if (response.config && response.config.cache) {
          const key = getRequestKey(response.config)
          const ttl = response.config.cacheTTL || 5 * 60 * 1000
          cacheMap.set(key, { data: res.data, timestamp: Date.now(), ttl })
        }
        return res.data
      } else {
        debounceMessage('warn', res.message || '请求失败')
        return Promise.reject(new Error(res.message || 'Error'))
      }
    }

    return res
  },
  async (error) => {
    const config = error.config || {}
    try {
      if (config) removePending(config)
    } catch (e) {}

    if (error.response && error.response.status === 401) {
      store.dispatch && store.dispatch('user/logout')
      debounceMessage('error', '登录过期，请重新登录')
      return Promise.reject(error)
    }

    config.__retryCount = config.__retryCount || 0
    const maxRetry = config.retries || 2

    const shouldRetry =
      !error.response ||
      (error.response && error.response.status >= 500) ||
      error.code === 'ECONNABORTED'

    if (config && config.__retryCount < maxRetry && shouldRetry) {
      config.__retryCount += 1
      const delay = Math.pow(2, config.__retryCount) * 100 + Math.random() * 100
      await new Promise((resolve) => setTimeout(resolve, delay))
      return service(config)
    }

    const msg =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      '网络错误'
    debounceMessage('error', msg)
    return Promise.reject(error)
  }
)

// 简单包装：支持 cache 在调用层做短路读取（stale-while-revalidate）
export async function request(config) {
  const cfg = Object.assign({}, config)
  cfg.method = (cfg.method || 'get').toLowerCase()
  const key = getRequestKey(cfg)

  if (cfg.cache && cacheMap.has(key)) {
    const entry = cacheMap.get(key)
    if (Date.now() - entry.timestamp < entry.ttl) {
      service(Object.assign({}, cfg)).catch(() => {})
      return Promise.resolve(entry.data)
    } else {
      cacheMap.delete(key)
    }
  }

  return service(cfg)
}

export default service
