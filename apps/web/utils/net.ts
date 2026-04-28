import { dispatchLocalStorageValueSet } from '@/app/hooks/utils/use-storage'
import { baseUrl } from '@/config/env'
import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import { jsonDateParser } from 'json-date-parser'
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
    // 由于前后端统一用一个schema 而且schema里面date都是直接写成z.date()，所以这里需要用jsonDateParser来解析一下日期字符串
    return resp.text().then(text => JSON.parse(text, jsonDateParser))
  },
})

export const jsonIntern = createAlova({
  baseURL: '',
  requestAdapter: adapterFetch(),
  cacheFor: null,
  responded: (resp) => {
    // 同上
    return resp.text().then(text => JSON.parse(text, jsonDateParser))
  },
})
