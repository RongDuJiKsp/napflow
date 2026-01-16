import { type BaseRespType, Code } from '@shared/data-transfer/_base'
import { App } from 'antd'
import { useCallback } from 'react'
import z from 'zod'

export type CommonSubmitConig = {
  // 成功提示 默认为 '表单提交成功' 给空字符串则不提示
  successText?: string
  // 失败提示 默认为 '表单校验失败' 给空字符串则不提示
  errorText?: string,
  afterSuccess?: () => void
}

export const useSubmitZodFn = <Req, Res extends BaseRespType<unknown>>(schema: z.ZodType<Req>, submit: (data: Req) => Promise<Res>, { successText = ' 表单提交成功', errorText = '表单校验失败', afterSuccess }: CommonSubmitConig = {}) => {
  const { message, notification } = App.useApp()
  return useCallback(async (data: Req) => {
    const validated = schema.safeParse(data)
    if(!validated.success) {
      notification.error({
        title: errorText,
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await submit(validated.data)
    if(res.statusCode !== Code.Ok) {
      if(errorText)
        message.error(res.message)

      return
    }
    if(successText)
      message.success(successText)

    afterSuccess?.()
    return res
  }, [schema, message, notification, submit, successText, errorText, afterSuccess])
}

export const useSubmitZod = <Req, Res extends BaseRespType<unknown>>(data: Req, schema: z.ZodType<Req>, submit: (data: Req) => Promise<Res>, config?: CommonSubmitConig) => {
  const fn = useSubmitZodFn(schema, submit, config)
  return useCallback(async () => {
    return await fn(data)
  }, [data, fn])
}
