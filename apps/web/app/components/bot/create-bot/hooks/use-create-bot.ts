import { AdapterTag } from '@shared/common/bot/base'
import type { CreateBotReq, CreateBotResp } from '@shared/data-transfer/bot/manager'
import { ZodCheckCreateBotReq }from '@shared/data-transfer/bot/manager'
import { useResetState } from 'ahooks'
import { adapterFormZod, defaultAdapterConfigFactory } from '../constances'
import { useAreaChangeDispatch, useAreaChangeHandler, useImmerCallback } from '@/app/hooks/utils/use-immer'
import type { Dispatch, SetStateAction } from 'react'
import { createContext, useCallback, useContext } from 'react'
import { noop } from 'lodash-es'
import { jsonQ } from '@/utils/net'
import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { App } from 'antd'
import z from 'zod'

export const AdapterConfigContecxt = createContext({})
export const AdapterConfigSetterContext = createContext<(config: CreateBotReq['adapterConfig']) => void>(noop)
export const useCreateBotConfig = <T>() => {
  return useContext(AdapterConfigContecxt) as T
}
export const useCreateBotSetConfig = <T>() => {
  return useContext(AdapterConfigSetterContext) as Dispatch<SetStateAction<T>>
}

const onSubmit = async (form: CreateBotReq) => await jsonQ.Post<CreateBotResp>('/bots/create', form)

export const useCreateBot = () => {
  const { notification } = App.useApp()
  const [form, setForm, resetForm] = useResetState<CreateBotReq>({
    name: '',
    description: '',
    commonConfig: { },
    adapterTag: AdapterTag.napcatWs,
    adapterConfig: defaultAdapterConfigFactory[AdapterTag.napcatWs](),
  })
  const handleNameChange = useAreaChangeHandler(setForm, 'name')
  const handleDescriptionChange = useAreaChangeHandler(setForm, 'description')
  const handleAdapterTagChange = useImmerCallback(setForm, (draft, tag: AdapterTag) => {
    draft.adapterTag = tag
    draft.adapterConfig = defaultAdapterConfigFactory[tag]()
  })
  const adapterConfigChangeDispath = useAreaChangeDispatch(setForm, 'adapterConfig')

  const handleAutoStartChange = useImmerCallback(setForm, (draft, value: boolean) => {
    draft.commonConfig.autoStart = value
  })

  const submitForm = useSubmitZod(form, ZodCheckCreateBotReq, onSubmit, { afterSuccess: resetForm })

  const submit = useCallback(async () => {
    const check = adapterFormZod[form.adapterTag]
    const verified = check.safeParse(form.adapterConfig)
    if(!verified.success) {
      notification.error({
        title: '配置检查失败',
        description: z.prettifyError(verified.error),
      })
      return
    }
    await submitForm()
  }, [submitForm, form, notification])

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
