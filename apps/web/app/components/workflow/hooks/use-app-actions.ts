import { useCallback, useState } from 'react'
import { type CreateWorkflowReq, ZodCheckCreateWorkflowReq } from '@shared/data-transfer/workflow/info'
import { useAreaChange } from '@/app/hooks/utils/use-immer'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import { Code } from '@shared/data-transfer/_base'
import { App } from 'antd'
import z from 'zod'
export const useAppCreate = () => {
  const { message, notification } = App.useApp()
  const [formValue, setFormValue] = useState<CreateWorkflowReq>({ appName: '', appDescription: '' })
  const handleChangeAppName = useAreaChange(setFormValue, 'appName')
  const handleChangeAppDesp = useAreaChange(setFormValue, 'appDescription')
  const handleSubmit = useCallback(async () => {
    const validated = ZodCheckCreateWorkflowReq.safeParse(formValue)
    if(!validated.success) {
      notification.error({
        title: '提交失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await jsonQ.Post<NullResp>('/workflow/create', validated.data)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('创建app成功')
  }, [formValue, message, notification])
  return {
    formValue,
    handleChangeAppName,
    handleChangeAppDesp,
    handleSubmit,
  }
}
