import type { NapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'

export const defaultNapcatForm = (): NapcatWsAdapterConfig => ({
  endpoint: {
    wsUrl: '',
    token: '',
  },
})
