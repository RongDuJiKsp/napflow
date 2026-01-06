import type { BotRecordEntity } from '@/src/apps/db/models/bot.entity'
import type { BotAdapterFactory, BotInstance } from './_base'
import { AdapterTag } from './_base'

export class NapcatWsAdapter implements BotInstance {
  readonly adapterDesc: string = 'Napcat Ws客户端'
  readonly adapterTag: AdapterTag = AdapterTag.napcatWs
  readonly botConfigDB: BotRecordEntity

  constructor(db: BotRecordEntity) {
    this.botConfigDB = db
  }
}
export const NapcatWsFactory: BotAdapterFactory = db => new NapcatWsAdapter(db)
