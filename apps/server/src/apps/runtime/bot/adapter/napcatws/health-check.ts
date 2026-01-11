import type { NCWebsocket } from '@rdjksp/node-napcat-ts'
import type { Registerable } from '../_base'
import { Logger } from '@nestjs/common'

// Napcat Client 健康检查
export class NCCHealthChecker implements Registerable {
  private readonly logger: Logger
  private readonly unsubscribes: (() => void)[] = []
  constructor(private readonly nc: NCWebsocket, private readonly ctxName: string) {
    this.logger = new Logger(this.checkerName)
  }

  get checkerName() {
    return `${this.ctxName}-${NCCHealthChecker.name}`
  }

  register() {
    if(this.unsubscribes.length)
      this.unregister()
    this.unsubscribes.push(
      this.nc.subscribe('meta_event.heartbeat', (ctx) => {
        this.logger.log(ctx)
      }),

    )
  }

  unregister() {
    for(const fn of this.unsubscribes)
      fn()
  }
}
