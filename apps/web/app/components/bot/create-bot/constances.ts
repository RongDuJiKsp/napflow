import { AdapterTag } from '@shared/common/bot/core/adapter'
import { ZodCheckNapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'
import { defaultNapcatForm } from './hooks/use-napcat-ws-form'
import NapcatWsForm from './adapter-form/NapcatWsForm'
import type z from 'zod'

export const defaultAdapterConfigFactory: Record<AdapterTag, () => object> = {
  [AdapterTag.napcatWs]: defaultNapcatForm,
}

export const adapterComponent: Record<AdapterTag, React.ComponentType> = {
  [AdapterTag.napcatWs]: NapcatWsForm,
}

export const adapterFormZod: Record<AdapterTag, z.ZodType> = {
  [AdapterTag.napcatWs]: ZodCheckNapcatWsAdapterConfig,
}
