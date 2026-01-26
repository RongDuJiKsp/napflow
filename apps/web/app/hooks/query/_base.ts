import { type BaseRespType, Code } from '@shared/data-transfer/_base'

export type DefineQueryFnConfig = {
  errMsgFallback?: string, // 错误信息兜底
  dataNullAsError?: boolean, // 是否需要数据为空时返回错误(即Boolean(data)=false) 默认为 true
}
export const defineQueryFn = <QResp extends BaseRespType<QData>, QData = undefined>(fn: () => Promise<QResp>, { errMsgFallback = '请求失败', dataNullAsError = true }: DefineQueryFnConfig = {}) => {
  return async () => {
    const res = await fn()
    if (res.statusCode !== Code.Ok || (dataNullAsError && !res.data))
      throw new Error(res.message || errMsgFallback)
    return res.data as QData
  }
}
