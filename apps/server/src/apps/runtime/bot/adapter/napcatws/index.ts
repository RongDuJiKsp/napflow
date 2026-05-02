import type { BotRecordEntity } from '@/src/apps/db/models/bot.entity'
import type { BotAdapterFactory, BotInstance } from '../_base'
import { Logger } from '@nestjs/common'
import { BotCoreRuntimeError } from '@runtime/middleware/bot-core-runtime.filter'
import type { BotAdapter } from '@shared/common/bot/core/adapter'
import type { BotState } from '@shared/common/bot/core/status'
import { BotRunningState } from '@shared/common/bot/core/status'
import { AdapterTag } from '@shared/common/bot/core/adapter'
import { BotSignal } from '@shared/common/bot/core/status'
import {
  type NapcatWsAdapterConfig,
  ZodCheckNapcatWsAdapterConfig,
} from '@shared/common/bot/napcatws-adapter'
import { NCCHealthChecker } from './health-check'
import type { WorkflowAppDataEntity } from '@/src/apps/db/models/workflow.entity'
import { NapcatWsTriggerPlugin } from './plugin'
import type { AppConfigService } from '@/src/apps/app-config/app-config.service'
import { NapcatWsSdk } from './sdk'
import type { BotPluginStatusSnapshot } from '@shared/common/bot/health-check'
import type { BotBridgeForBotService } from '../../bridge/bot-bridge-for-bot'
import type { PluginService } from '@/src/utils/traits'

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
  readonly bindingApps: WorkflowAppDataEntity[]
  readonly config: AppConfigService
  readonly bridge: BotBridgeForBotService
  // db computed
  private readonly logger: Logger
  // conn instances
  private botConfigSnapshot?: NapcatWsAdapterConfig
  private sdkConn: NapcatWsSdk | null = null
  // plugins
  private plugins: NapcatWsTriggerPlugin[] | null = null
  // services
  private healthChecker: NCCHealthChecker | null = null

  get botName() {
    return `${NapcatWsAdapter.name}-${this.botConfigDB.botName}`
  }

  constructor(
    db: BotRecordEntity,
    binding: WorkflowAppDataEntity[],
    cfg: AppConfigService,
    bridge: BotBridgeForBotService,
  ) {
    this.config = cfg
    this.botConfigDB = db
    this.bindingApps = binding
    this.bridge = bridge
    this.botConfigSnapshot = ZodCheckNapcatWsAdapterConfig.safeParse(
      db.adapterConfig,
    ).data // 配置有问题先init完 等bootstrap时再抛错
    this.logger = new Logger(this.botName)
  }

  signal(signal: BotSignal) {
    this.logger.log(`Recv signal : ${signal}(${BotSignal[signal]})`)
    switch (signal) {
      case BotSignal.SIGSTOP:
        this.stop().then(() => {
          this.clean()
        })
        break
      case BotSignal.SIGKILL:
        this.clean()
        break
    }
  }

  get runningStateEnum(): BotRunningState {
    if (!this.healthChecker || !this.sdkConn) return BotRunningState.killed
    if (!this.healthChecker?.isConnetUpstream) return BotRunningState.offline
    return BotRunningState.running
  }

  runningState(): BotState {
    return {
      runningState: this.runningStateEnum,
      upStreamState: this.healthChecker?.upstreamStatus,
      bootTime: this.healthChecker?.createAt,
    }
  }

  sourceSnapshot(): BotPluginStatusSnapshot | null {
    return this.healthChecker?.pluginStatus() ?? null
  }

  get registerable() {
    return [this.healthChecker].filter(Boolean) as PluginService<[]>[]
  }

  async bootstrapPlugins(_cfg: NonNullable<typeof this.botConfigSnapshot>) {
    this.logger.log('Bootstrap plugins...')
    this.plugins = []
    for (const appBinding of (await this.bridge.getBindingsInfo(
      this.botConfigDB.botId,
    )) ?? []) {
      const app = appBinding.appPublish
      if (!app.nodes || !app.edges) {
        this.logger.warn(
          `App ${app.ofAppId}@${app.version} has no nodes or edges. Skip.`,
        )
        continue
      }
      const bindingConfig = await this.bridge.getBindingConfig(
        this.botConfigDB.botId,
        appBinding.bindingId,
      )
      try{
        this.plugins.push(
          new NapcatWsTriggerPlugin(
            app.nodes,
            app.edges,
            app.envs || [],
            bindingConfig || {},
          ),
        )
      }
      catch (err) {
        this.logger.error(
          `Failed to create plugin for app ${app.ofAppId}@${app.version} with binding ${appBinding.bindingId}. Error: ${err}`,
        )
      }
    }
  }

  async bootstrapSDKAndService(
    cfg: NonNullable<typeof this.botConfigSnapshot>,
  ) {
    this.logger.log('Bootstrap SDK...')
    // init sdk
    this.sdkConn = new NapcatWsSdk({
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
    this.healthChecker = new NCCHealthChecker(
      this.sdkConn,
      cfg,
      this.botName,
      this.plugins || [],
    )

    this.registerable.forEach(s => s.mount())
    this.logger.log('service is registered')
    // finish
    await this.sdkConn.connect()
    this.logger.log('conn created')

    this.healthChecker.selfBeat()
  }

  async bootstrap(): Promise<this> {
    this.logger.log('Bootstrap...')
    const cfg = this.botConfigSnapshot
    if (!cfg) {
      this.logger.error('Config is invalid. Stop bootstrap.')
      throw new BotCoreRuntimeError('config is invalid')
    }
    await this.bootstrapPlugins(cfg)
    await this.bootstrapSDKAndService(cfg)

    this.plugins?.forEach((p) => {
      p.mount(this.sdkConn!)
    })

    return this
  }

  async stop() {
    this.logger.log('Stopping bot...')
    this.registerable.forEach(s => s.unmount())
    this.healthChecker = null
    this.logger.log('service is unregistered')
    this.plugins?.forEach((p) => {
      p.unmount()
    })
    this.plugins = null
    this.logger.log('plugins is unmounted')
  }

  async clean() {
    this.logger.log('Cleaning resources...')
    this.sdkConn?.disconnect()
    this.sdkConn = null
    this.logger.log('conn closed')
  }
}
export const NapcatWsFactory: BotAdapterFactory = async (
  db,
  binding,
  cfg,
  bridge,
) => await new NapcatWsAdapter(db, binding, cfg, bridge).bootstrap()
