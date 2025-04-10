import axios from 'axios'
import store from '../store'
import { message as $message } from '@/libs'

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    config.headers.icode = 'your-icode'
    if (store.getters.token) {
      // 如果token存在 注入token
      config.headers.Authorization = `Bearer ${store.getters.token}`
    }
    return config // 必须返回配置
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器,服务器返回数据之后，前端.then之前被调用
service.interceptors.response.use(
  (response) => {
    const { success, message, data } = response.data
    //   要根据success的成功与否决定下面的操作
    if (success) {
      return data
    } else {
      $message('warn', message)
      // TODO：业务错误
      return Promise.reject(new Error(message))
    }
  },
  //服务端返回非200的状态码
  (error) => {
    // 处理 token 超时问题
    if (
      error.response &&
      error.response.data &&
      error.response.data.code === 401
    ) {
      // TODO: token超时
      store.dispatch('user/logout')
    }
    $message('error', error.response.data.message)
    // TODO: 提示错误消息
    return Promise.reject(error)
  }
)

export default service
