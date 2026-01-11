import type { NapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'
import { useCreateBotConfig, useCreateBotSetConfig } from './use-create-bot'
import { useImmerCallback } from '@/app/hooks/utils/use-immer'

export const defaultNapcatForm = (): Omit<
  NapcatWsAdapterConfig,
  'heartBeatDuration'
>
  & Partial<Pick<NapcatWsAdapterConfig, 'heartBeatDuration'>> => ({
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
  const handleReconnectMaxAttemptsChange = useImmerCallback(
    setConfig,
    (draft, value: string) => {
      draft.retryConfig = draft.retryConfig || {
        retryMaxTimes: 0,
        retryDelay: 0,
      }
      draft.retryConfig.retryMaxTimes = Number(value || 0)
    },
  )
  const handleReconnectIntervalChange = useImmerCallback(
    setConfig,
    (draft, value: string) => {
      draft.retryConfig = draft.retryConfig || {
        retryMaxTimes: 0,
        retryDelay: 0,
      }
      draft.retryConfig.retryDelay = Number(value || 0)
    },
  )
  const handleHeartBeatDurationlChange = useImmerCallback(
    setConfig,
    (draft, value: string) => {
      draft.heartBeatDuration = Number.parseInt(value) || 0
    },
  )
  return {
    config,
    handleEndpointWsUrlChange,
    handleEndpointTokenChange,
    handleReconnectMaxAttemptsChange,
    handleReconnectIntervalChange,
    handleHeartBeatDurationlChange,
  }
}
