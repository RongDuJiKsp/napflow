import type { BotRecordEntity } from '@/src/apps/db/models/bot.entity'
import type { BotAdapterFactory, BotInstance } from './_base'
import { Logger } from '@nestjs/common'
import { BotCoreRuntimeError } from '../../middleware/bot-core-runtime.filter'
import type { BotAdapter, BotState } from '@shared/common/bot/base'
import { AdapterTag, BotRunningState, BotSignal } from '@shared/common/bot/base'
import { type NapcatWsAdapterConfig, ZodCheckNapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'

export class NapcatWsAdapter implements BotInstance {
  static readonly meta: BotAdapter = {
    tag: AdapterTag.napcatWs,
    desc: 'Napcat Ws客户端',
  }

  readonly desc: string = NapcatWsAdapter.meta.desc
  readonly tag: AdapterTag = NapcatWsAdapter.meta.tag
  readonly botConfigDB: BotRecordEntity
  private readonly botConfigSnapshot?: NapcatWsAdapterConfig
  private readonly logger: Logger

  constructor(db: BotRecordEntity) {
    this.botConfigDB = db
    this.botConfigSnapshot = ZodCheckNapcatWsAdapterConfig.safeParse(db.adapterConfig).data // 配置有问题先init完 等bootstrap时再抛错
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
    if(!this.botConfigSnapshot) {
      this.logger.error('Config is invalid. Stop bootstrap.')
      throw new BotCoreRuntimeError('NapcatWsAdapter config is invalid')
    }
    return this
  }
}
export const NapcatWsFactory: BotAdapterFactory = async db => await new NapcatWsAdapter(db).bootstrap()
