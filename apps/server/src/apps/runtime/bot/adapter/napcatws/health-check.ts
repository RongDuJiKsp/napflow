import { Logger } from '@nestjs/common'
import { BotUpstreamState } from '@shared/common/bot/base'
import type { NapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'
import type { NapcatWsSdk } from './sdk'
import type { NapcatWsTriggerPlugin } from './plugin'
import type { BotPluginStatusSnapshot } from '@shared/common/bot/health-check'
import type { PluginService } from '@/src/utils/traits'
import { RegisterManager } from '@/src/utils/registerbale'

export type HeartBeatSnapshot = {
  heartbeatAt: Date;
  online: boolean;
  ok: boolean;
}

// Napcat Client 健康检查
export class NCCHealthChecker implements PluginService<[]> {
  private readonly logger: Logger
  readonly createAt = new Date()

  constructor(
    private readonly nc: NapcatWsSdk,
    private readonly cfg: NapcatWsAdapterConfig,
    private readonly ctxName: string,
    private readonly plugins: NapcatWsTriggerPlugin[],
  ) {
    this.logger = new Logger(this.checkerName)
  }

  get checkerName() {
    return `${this.ctxName}-${NCCHealthChecker.name}`
  }

  private readonly registerManager: RegisterManager = new RegisterManager()
  private heartbeatSnapshot: HeartBeatSnapshot | null = null

  mount() {
    this.registerManager.register(
      this.nc.subscribe('meta_event.heartbeat', (ctx) => {
        this.heartbeatSnapshot = {
          heartbeatAt: new Date(),
          online: ctx.status.online ?? false,
          ok: ctx.status.good,
        }
      }),
    )
  }

  unmount() {
    this.registerManager.clear()
  }

  selfBeat() {
    this.heartbeatSnapshot = {
      heartbeatAt: new Date(),
      online: true,
      ok: true,
    }
  }

  get isConnetUpstream() {
    return (
      this.heartbeatSnapshot
      && Date.now() - this.heartbeatSnapshot.heartbeatAt.valueOf()
        < this.cfg.heartBeatDuration
    )
  }

  get upstreamStatus(): BotUpstreamState | undefined {
    // !this.heartbeatSnapshot to make ts happy
    if (!this.isConnetUpstream || !this.heartbeatSnapshot) return undefined

    if (!this.heartbeatSnapshot.ok) return BotUpstreamState.fatal

    if (!this.heartbeatSnapshot.online) return BotUpstreamState.offline

    return BotUpstreamState.ok
  }

  pluginStatus(): BotPluginStatusSnapshot {
    return {
      taskQueueLength: this.plugins
        .map(plugin => plugin.threadList.length)
        .reduce((acc, cur) => acc + cur, 0),
      nodeQueueLength: this.plugins
        .map(plugin =>
          plugin.threadList.reduce(
            (acc, cur) => acc + cur.graphRunner.size(),
            0,
          ),
        )
        .reduce((acc, cur) => acc + cur, 0),
    }
  }
}
