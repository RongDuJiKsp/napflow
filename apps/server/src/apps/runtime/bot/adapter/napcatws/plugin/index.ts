import { CommPlugin } from '@/src/apps/runtime/core/workflow/pool'
import type { Edge, Node } from '@shared/common/workflow/core'
import { NcKlassMap } from './constant'
import { TriggerOnEvents } from '@/src/apps/runtime/core/workflow/node'
import type { NapcatWsSdk } from '../sdk'

export class NapcatWsTriggerPlugin extends CommPlugin<NapcatWsSdk> {
  constructor(nodes: Node[], edges: Edge[]) {
    super(nodes, edges, NcKlassMap)
  }

  private unsubscribes: Array<() => void> | null = null

  mount(sdk: NapcatWsSdk) {
    super.mount(sdk)
    this.unsubscribes = [
      sdk.subscribe('message.group', async (msg) => {
        this.onTrigger(TriggerOnEvents.ChatMessage, {
          gid: String(msg.group_id),
          hmsg: await sdk.parseChain(msg.message),
          messageid: String(msg.message_id),
        })
      }),
      sdk.subscribe('message.private', async (msg) => {
        this.onTrigger(TriggerOnEvents.ChatMessage, {
          uid: String(msg.user_id),
          hmsg: await sdk.parseChain(msg.message),
          messageid: String(msg.message_id),
        })
      }),
    ]
  }

  unmount() {
    this.unsubscribes?.forEach(unsubscribe => unsubscribe())
    super.unmount()
  }
}
