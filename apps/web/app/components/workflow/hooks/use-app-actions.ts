import { useState } from 'react'
import { type CreateWorkflowReq, ZodCheckCreateWorkflowReq } from '@shared/data-transfer/workflow/info'
import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import { useSubmitZod } from '@/app/hooks/utils/use-form'

const submitCreate = async (data: CreateWorkflowReq) => await jsonQ.Post<NullResp>('/workflow/create', data)

export const useAppCreate = () => {
  const [formValue, setFormValue] = useState<CreateWorkflowReq>({ appName: '', appDescription: '' })
  const handleChangeAppName = useAreaChangeHandler(setFormValue, 'appName')
  const handleChangeAppDesp = useAreaChangeHandler(setFormValue, 'appDescription')
  const handleSubmit = useSubmitZod(formValue, ZodCheckCreateWorkflowReq, submitCreate, { successText: '创建app成功' })
  return {
    formValue,
    handleChangeAppName,
    handleChangeAppDesp,
    handleSubmit,
  }
}
