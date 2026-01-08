import { AdapterTag } from '@shared/common/bot/base'
import type { CreateBotReq } from '@shared/data-transfer/bot/manager'
import { useResetState } from 'ahooks'
import { defaultAdapterConfigFactory } from '../constances'
import { useAreaChange } from '@/app/hooks/utils/use-area-change'
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
  const handleAdapterTagChange = useAreaChange(setForm, 'adapterTag')
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

export const AdapterConfigSetterContext = createContext(noop)

export const useCreateBotSetConfig = () => {
  return useContext(AdapterConfigSetterContext)
}
