import type { NapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'
import { useCreateBotConfig, useCreateBotSetConfig } from './use-create-bot'
import { useImmerCallback } from '@/app/hooks/utils/use-immer'

export const defaultNapcatForm = (): NapcatWsAdapterConfig => ({
  endpoint: {
    wsUrl: '',
    token: '',
  },
})

export const useNapcatWsConfigForm = () => {
  const config = useCreateBotConfig<NapcatWsAdapterConfig>()
  const setConfig = useCreateBotSetConfig<NapcatWsAdapterConfig>()
  const handleEndpointWsUrlChange = useImmerCallback(
    setConfig,
    (draft, value: string) => {
      draft.endpoint.wsUrl = value
    },
  )
  const handleEndpointTokenChange = useImmerCallback(
    setConfig,
    (draft, value: string) => {
      draft.endpoint.token = value
    },
  )
  return {
    config,
    handleEndpointWsUrlChange,
    handleEndpointTokenChange,
  }
}
