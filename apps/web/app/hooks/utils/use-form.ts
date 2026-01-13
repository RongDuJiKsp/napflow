import { type BaseRespType, Code } from '@shared/data-transfer/_base'
import { App } from 'antd'
import { useCallback } from 'react'
import z from 'zod'

export type CommonSubmitConig = {
  successText?: string
  errorText?: string,
  afterSuccess?: () => void
}

export const useSubmitZod = <Req, Res extends BaseRespType<unknown>>(data: Req, schema: z.ZodType<Req>, submit: (data: Req) => Promise<Res>, { successText = ' 表单提交成功', errorText = '表单校验失败', afterSuccess }: CommonSubmitConig = {}) => {
  const { message, notification } = App.useApp()
  return useCallback(async () => {
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
      message.error(res.message)
      return
    }
    message.success(successText)
    afterSuccess?.()
    return res
  }, [data, schema, message, notification, submit, successText, errorText, afterSuccess])
}
