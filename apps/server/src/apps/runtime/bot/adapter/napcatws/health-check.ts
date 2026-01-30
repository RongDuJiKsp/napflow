import type { Registerable } from '../_base'
import { Logger } from '@nestjs/common'
import { BotUpstreamState } from '@shared/common/bot/base'
import type { NapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'
import type { NapcatWsSdk } from './sdk'

export type HeartBeatSnapshot = {
  heartbeatAt: Date;
  online: boolean;
  ok: boolean;
}

// Napcat Client 健康检查
export class NCCHealthChecker implements Registerable {
  private readonly logger: Logger
  readonly createAt = new Date()

  constructor(
    private readonly nc: NapcatWsSdk,
    private readonly cfg: NapcatWsAdapterConfig,
    private readonly ctxName: string,
  ) {
    this.logger = new Logger(this.checkerName)
  }

  get checkerName() {
    return `${this.ctxName}-${NCCHealthChecker.name}`
  }

  private unsubscribes: (() => void)[] = []
  private heartbeatSnapshot: HeartBeatSnapshot | null = null

  register() {
    if (this.unsubscribes.length) this.unregister()
    this.unsubscribes.push(
      this.nc.subscribe('meta_event.heartbeat', (ctx) => {
        this.heartbeatSnapshot = {
          heartbeatAt: new Date(),
          online: ctx.status.online ?? false,
          ok: ctx.status.good,
        }
      }),
    )
  }

  unregister() {
    for (const fn of this.unsubscribes) fn()
    this.unsubscribes = []
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
}
