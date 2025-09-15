import request from '@/utils/request'

export const getCategory = () => {
  return request({
    url: '/category',
    cache: true, // 开启缓存
    cacheTTL: 10 * 60 * 1000 // 可选，缓存 10 分钟（默认 5 分钟）
  })
}
