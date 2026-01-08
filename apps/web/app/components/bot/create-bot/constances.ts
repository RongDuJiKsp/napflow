import { AdapterTag } from '@shared/common/bot/base'
import { defaultNapcatForm } from './hooks/use-napcat-ws-form'
import NapcatWsForm from './adapter-form/NapcatWsForm'

export const defaultAdapterConfigFactory: Record<AdapterTag, () => object> = {
  [AdapterTag.napcatWs]: defaultNapcatForm,
}

export const adapterComponent: Record<AdapterTag, React.ComponentType> = {
  [AdapterTag.napcatWs]: NapcatWsForm,
}
