import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import { type CreateWorkflowReq, ZodCheckCreateWorkflowReq } from '@shared/data-transfer/workflow/info'
import { useResetState } from 'ahooks'

const submitForm = async (form: CreateWorkflowReq) => await jsonQ.Post<NullResp>('workflows', form)
export const useCreateApp = () => {
  const [form, setForm] = useResetState<CreateWorkflowReq>({
    appName: '',
    appDescription: '',
  })
  const handleChangeAppName = useAreaChangeHandler(setForm, 'appName')
  const handleChangeAppDescription = useAreaChangeHandler(setForm, 'appDescription')
  const handleSubmit = useSubmitZod(form, ZodCheckCreateWorkflowReq, submitForm)

  return {
    form,
    handleChangeAppName,
    handleChangeAppDescription,
    handleSubmit,
  }
}
