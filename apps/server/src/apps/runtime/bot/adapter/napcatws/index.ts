import type { BotRecordEntity } from '@/src/apps/db/models/bot.entity'
import type { BotAdapterFactory, BotInstance, Registerable } from '../_base'
import { Logger } from '@nestjs/common'
import { BotCoreRuntimeError } from '../../../middleware/bot-core-runtime.filter'
import type { BotAdapter, BotState } from '@shared/common/bot/base'
import { AdapterTag, BotRunningState, BotSignal } from '@shared/common/bot/base'
import { type NapcatWsAdapterConfig, ZodCheckNapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'
import { NCWebsocket } from '@rdjksp/node-napcat-ts'
import { NCCHealthChecker } from './health-check'

export class NapcatWsAdapter implements BotInstance {
  // metas
  static readonly meta: BotAdapter = {
    tag: AdapterTag.napcatWs,
    desc: 'Napcat Ws客户端',
  }

  readonly desc: string = NapcatWsAdapter.meta.desc
  readonly tag: AdapterTag = NapcatWsAdapter.meta.tag
  // db base
  readonly botConfigDB: BotRecordEntity
  // db computed
  private readonly logger: Logger
  // conn instances
  private botConfigSnapshot?: NapcatWsAdapterConfig
  private sdkConn: NCWebsocket | null = null
  // services
  private healthChecker: NCCHealthChecker | null = null

  get botName() {
    return `${NapcatWsAdapter.name}-${this.botConfigDB.name}`
  }

  constructor(db: BotRecordEntity) {
    this.botConfigDB = db
    this.botConfigSnapshot = ZodCheckNapcatWsAdapterConfig.safeParse(db.adapterConfig).data // 配置有问题先init完 等bootstrap时再抛错
    this.logger = new Logger(this.botName)
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
    const cfg = this.botConfigSnapshot
    if(!cfg) {
      this.logger.error('Config is invalid. Stop bootstrap.')
      throw new BotCoreRuntimeError('config is invalid')
    }
    // init sdk
    this.sdkConn = new NCWebsocket({
      baseUrl: cfg.endpoint.wsUrl,
      accessToken: cfg.endpoint.token,
      reconnection: {
        attempts: cfg.retryConfig?.retryMaxTimes,
        delay: cfg.retryConfig?.retryDelay,
        enable: !!cfg.retryConfig,
      },
    })
    this.logger.log('SDK inited')
    // init services
    this.healthChecker = new NCCHealthChecker(this.sdkConn, this.botName)
    const services: Registerable[] = [
      this.healthChecker,
    ]
    for(const service of services)
      service.register()
    this.logger.log('service is registered')
    // finish
    await this.sdkConn.connect()
    this.logger.log('conn created')

    return this
  }
}
export const NapcatWsFactory: BotAdapterFactory = async db => await new NapcatWsAdapter(db).bootstrap()
