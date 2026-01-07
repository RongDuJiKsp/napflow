import type { BotRecordEntity } from '@/src/apps/db/models/bot.entity'
import type { BotAdapterFactory, BotInstance } from './_base'
import { BotSignal } from './_base'
import type { BotAdapter, BotState } from '@shared/data-transfer/bot/_base'
import { AdapterTag, BotRunningState } from '@shared/data-transfer/bot/_base'
import { Logger } from '@nestjs/common'

export class NapcatWsAdapter implements BotInstance {
  static readonly adapterMeta: BotAdapter = {
    adapterTag: AdapterTag.napcatWs,
    adapterDesc: 'Napcat Ws客户端',
  }

  readonly adapterDesc: string = NapcatWsAdapter.adapterMeta.adapterDesc
  readonly adapterTag: AdapterTag = NapcatWsAdapter.adapterMeta.adapterTag
  readonly botConfigDB: BotRecordEntity
  private readonly logger: Logger

  constructor(db: BotRecordEntity) {
    this.botConfigDB = db
    this.logger = new Logger(`${NapcatWsAdapter.name}-${db.name}`)
  }

  signal(signal: BotSignal) {
    this.logger.log(`Recv signal : ${signal}(${BotSignal[signal]})`)
  }

  runningState(): BotState {
    return {
      runningState: BotRunningState.stopped,
    }
  }

  async bootstrap(): Promise<this> {
    this.logger.log('Bootstrap...')
    return this
  }
}
export const NapcatWsFactory: BotAdapterFactory = async db => await new NapcatWsAdapter(db).bootstrap()
