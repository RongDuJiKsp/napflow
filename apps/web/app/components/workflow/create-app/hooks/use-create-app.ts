import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import { type CreateWorkflowReq, ZodCheckCreateWorkflowReq } from '@shared/data-transfer/workflow/info'
import { useResetState } from 'ahooks'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

const submitForm = async (form: CreateWorkflowReq) => await jsonQ.Post<NullResp>('/workflow/create', form)
export const useCreateApp = () => {
  const router = useRouter()
  const [form, setForm] = useResetState<CreateWorkflowReq>({
    appName: '',
    appDescription: '',
  })
  const handleChangeAppName = useAreaChangeHandler(setForm, 'appName')
  const handleChangeAppDescription = useAreaChangeHandler(setForm, 'appDescription')
  const afterSubmit = useCallback(() => {
    router.back()
  }, [router])
  const handleSubmit = useSubmitZod(form, ZodCheckCreateWorkflowReq, submitForm, { afterSuccess: afterSubmit })

  return {
    form,
    handleChangeAppName,
    handleChangeAppDescription,
    handleSubmit,
  }
}
