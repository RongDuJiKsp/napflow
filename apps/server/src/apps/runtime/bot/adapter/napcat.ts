import type { BotAdapter } from './_base'
import { AdapterTag } from './_base'

export class NapcatWsAdapter implements BotAdapter {
  readonly adapterDesc: string = 'Napcat Ws客户端'
  readonly adapterTag: AdapterTag = AdapterTag.napcatWs
}
