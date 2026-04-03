import { dispatchLocalStorageValueSet } from '@/app/hooks/utils/use-storage'
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
    // 当响应状态为401时，清除token 等待中间件发起跳转到登录页
    if (resp.status === 401) {
      dispatchLocalStorageValueSet('auth-token', undefined)
      throw new Error('Unauthorized')
    }
    return resp.json()
  },
})
