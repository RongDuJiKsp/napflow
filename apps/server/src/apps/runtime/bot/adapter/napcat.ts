import type { BotRecordEntity } from '@/src/apps/db/models/bot.entity'
import type { BotAdapterFactory, BotInstance } from './_base'
import type { BotAdapter, BotStateType } from '@shared/data-transfer/bot/_base'
import { AdapterTag, BotRunningState } from '@shared/data-transfer/bot/_base'

export class NapcatWsAdapter implements BotInstance {
  static readonly adapterMeta: BotAdapter = {
    adapterTag: AdapterTag.napcatWs,
    adapterDesc: 'Napcat Ws客户端',
  }

  readonly adapterDesc: string = NapcatWsAdapter.adapterMeta.adapterDesc
  readonly adapterTag: AdapterTag = NapcatWsAdapter.adapterMeta.adapterTag
  readonly botConfigDB: BotRecordEntity

  constructor(db: BotRecordEntity) {
    this.botConfigDB = db
  }

  runningState(): BotStateType {
    return {
      runningState: BotRunningState.stopped,
    }
  }
}
export const NapcatWsFactory: BotAdapterFactory = db => new NapcatWsAdapter(db)
