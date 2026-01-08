import { AdapterTag } from '@shared/common/bot/base'
import type { CreateBotReq } from '@shared/data-transfer/bot/manager'
import { useResetState } from 'ahooks'
import { defaultAdapterConfigFactory } from '../constances'
import { useAreaChange, useImmerCallback } from '@/app/hooks/utils/use-immer'
import { createContext, useContext } from 'react'
import { noop } from 'lodash-es'

export const useCreateBot = () => {
  const [form, setForm, resetForm] = useResetState<CreateBotReq>({
    name: '',
    description: '',
    adapterTag: AdapterTag.napcatWs,
    adapterConfig: defaultAdapterConfigFactory[AdapterTag.napcatWs](),
  })
  const handleNameChange = useAreaChange(setForm, 'name')
  const handleDescriptionChange = useAreaChange(setForm, 'description')
  const handleAdapterTagChange = useImmerCallback(setForm, (draft, tag: AdapterTag) => {
    draft.adapterTag = tag
    draft.adapterConfig = defaultAdapterConfigFactory[tag]()
  })
  const handleAdapterConfigChange = useAreaChange(setForm, 'adapterConfig')
  return {
    form,
    resetForm,
    handleNameChange,
    handleDescriptionChange,
    handleAdapterTagChange,
    handleAdapterConfigChange,
  }
}

export const AdapterConfigContecxt = createContext({})
export const AdapterConfigSetterContext = createContext<(config: CreateBotReq['adapterConfig']) => void>(noop)
export const useCreateBotConfig = <T>() => {
  return useContext(AdapterConfigContecxt) as T
}
export const useCreateBotSetConfig = <T>() => {
  return useContext(AdapterConfigSetterContext) as (config: T) => void
}
