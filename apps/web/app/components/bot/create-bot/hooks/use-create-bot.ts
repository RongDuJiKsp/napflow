import { AdapterTag } from '@shared/common/bot/core/adapter'
import type {
  CreateBotReq,
  CreateBotResp,
} from '@shared/data-transfer/bot/manager'
import { ZodCheckCreateBotReq } from '@shared/data-transfer/bot/manager'
import { useResetState } from 'ahooks'
import { adapterFormZod, defaultAdapterConfigFactory } from '../constances'
import {
  useAreaChangeDispatch,
  useAreaChangeHandler,
  useImmerCallback,
} from '@/app/hooks/utils/use-immer'
import { useCallback } from 'react'
import { jsonQ } from '@/utils/net'
import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { App } from 'antd'
import z from 'zod'
import { useRouter } from 'next/navigation'
import { createContextState } from '@/utils/react-wrap'

const {
  Provider: AdapterConfigStateProvider,
  useValue: useCreateBotConfig,
  useSetter: useCreateBotSetConfig,
} = createContextState<CreateBotReq['adapterConfig']>()
export {
  AdapterConfigStateProvider,
  useCreateBotConfig,
  useCreateBotSetConfig,
}

const onSubmit = async (form: CreateBotReq) =>
  await jsonQ.Post<CreateBotResp>('/bot/record/create', form)

export const useCreateBot = () => {
  const router = useRouter()
  const { notification } = App.useApp()
  const [form, setForm, resetForm] = useResetState<CreateBotReq>({
    name: '',
    description: '',
    commonConfig: {},
    adapterTag: AdapterTag.napcatWs,
    adapterConfig: defaultAdapterConfigFactory[AdapterTag.napcatWs](),
  })
  const handleNameChange = useAreaChangeHandler(setForm, 'name')
  const handleDescriptionChange = useAreaChangeHandler(setForm, 'description')
  const handleAdapterTagChange = useImmerCallback(
    setForm,
    (draft, tag: AdapterTag) => {
      draft.adapterTag = tag
      draft.adapterConfig = defaultAdapterConfigFactory[tag]()
    },
  )
  const adapterConfigChangeDispath = useAreaChangeDispatch(
    setForm,
    'adapterConfig',
  )

  const handleAutoStartChange = useImmerCallback(
    setForm,
    (draft, value: boolean) => {
      draft.commonConfig.autoStart = value
    },
  )

  const submitForm = useSubmitZod(form, ZodCheckCreateBotReq, onSubmit, {
    afterSuccess: resetForm,
  })

  const submit = useCallback(async () => {
    const check = adapterFormZod[form.adapterTag]
    const verified = check.safeParse(form.adapterConfig)
    if (!verified.success) {
      notification.error({
        title: '配置检查失败',
        description: z.prettifyError(verified.error),
      })
      return
    }
    await submitForm()
    router.back()
  }, [submitForm, form, notification, router])

  return {
    form,
    resetForm,
    handleNameChange,
    handleDescriptionChange,
    handleAdapterTagChange,
    adapterConfigChangeDispath,
    handleAutoStartChange,
    submit,
  }
}
