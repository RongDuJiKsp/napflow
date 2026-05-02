import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { jsonQ } from '@/utils/net'
import type { CreateWorkflowResp } from '@shared/data-transfer/workflow/info'
import {
  type CreateWorkflowReq,
  ZodCheckCreateWorkflowReq,
} from '@shared/data-transfer/workflow/info'
import { useResetState } from 'ahooks'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

const submitForm = async (form: CreateWorkflowReq) =>
  await jsonQ.Post<CreateWorkflowResp>('/workflow/record/create', form)
export const useCreateApp = () => {
  const router = useRouter()
  const [form, setForm] = useResetState<CreateWorkflowReq>({
    appName: '',
    appDescription: '',
  })
  const handleChangeAppName = useAreaChangeHandler(setForm, 'appName')
  const handleChangeAppDescription = useAreaChangeHandler(
    setForm,
    'appDescription',
  )
  const onSubmit = useSubmitZod(form, ZodCheckCreateWorkflowReq, submitForm, {
    successText: '创建应用成功',
  })
  const handleSubmit = useCallback(async () => {
    const resp = await onSubmit()
    if (!resp?.data) return
    router.push(`/workflows/${resp.data.appId}`)
  }, [onSubmit, router])

  return {
    form,
    handleChangeAppName,
    handleChangeAppDescription,
    handleSubmit,
  }
}
