import { baseUrl } from '@/config/env'
import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
export const jsonQ = createAlova({
  baseURL: baseUrl,
  requestAdapter: adapterFetch(),
  cacheFor: null,
  beforeRequest: (method) => {
    method.config.headers.Authorization = `Bearer ${localStorage.getItem('auth-token')}`
  },
  responded: (resp) => {
    // 当响应状态为401时，清除token并刷新（跳转到登录页）
    if (resp.status === 401) {
      localStorage.removeItem('auth-token')
      globalThis.location.reload()
      return
    }
    return resp.json()
  },
})
