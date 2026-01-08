import type { NapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'
import { useCreateBotConfig, useCreateBotSetConfig } from './use-create-bot'

export const defaultNapcatForm = (): NapcatWsAdapterConfig => ({
  endpoint: {
    wsUrl: '',
    token: '',
  },
})

export const useNapcatWsConfigForm = () => {
  const config = useCreateBotConfig<NapcatWsAdapterConfig>()
  const setConfig = useCreateBotSetConfig<NapcatWsAdapterConfig>()
  return { config, setConfig }
}
