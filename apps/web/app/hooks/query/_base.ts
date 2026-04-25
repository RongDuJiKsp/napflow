import type { ZodBaseRespType } from '@shared/data-transfer/_base'
import { type BaseRespType, Code } from '@shared/data-transfer/_base'
import type z from 'zod'

export type DefineQueryFnConfig = {
  errMsgFallback?: string; // 错误信息兜底
  dataNullAsError?: boolean; // 是否需要数据为空时返回错误(即Boolean(data)=false) 默认为 true
}
/**
 * @deprecated use defineZodQueryFn
 */
export const defineQueryFn = <
  QResp extends BaseRespType<QData>,
  QData = undefined,
>(
  fn: () => Promise<QResp>,
  {
    errMsgFallback = '请求失败',
    dataNullAsError = true,
  }: DefineQueryFnConfig = {},
) => {
  return async () => {
    const res = await fn()
    if (res.statusCode !== Code.Ok || (dataNullAsError && !res.data))
      throw new Error(res.message || errMsgFallback)
    return res.data as QData
  }
}

export type DefineZodQueryFnConfig = {
  errMsgFallback?: string; // 错误信息兜底
}
export const defineZodQueryFn = <QData, RespSchema extends ZodBaseRespType<QData> = ZodBaseRespType<QData>>(
  schema: RespSchema,
  fn: () => Promise<z.output<RespSchema>>,
  {
    errMsgFallback = '请求失败',
  }: DefineZodQueryFnConfig = {},
) => {
  return async () => {
    const res = schema.parse(await fn())
    if (res.statusCode !== Code.Ok)
      throw new Error(res.message || errMsgFallback)
    return res.data
  }
}
