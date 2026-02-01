import { CommPlugin } from '@/src/apps/runtime/core/workflow/pool'
import type { Edge, Node } from '@shared/common/workflow/core'
import { NcKlassMap } from './constant'
import { TriggerOnEvents } from '@/src/apps/runtime/core/workflow/node'
import type { NapcatWsSdk } from '../sdk'

export class NapcatWsTriggerPlugin extends CommPlugin {
  constructor(nodes: Node[], edges: Edge[]) {
    super(nodes, edges, NcKlassMap)
  }

  private unsubscribes: Array<() => void> | null = null

  mount(sdk: NapcatWsSdk) {
    this.unsubscribes = [
      sdk.subscribe('message.group', async (msg) => {
        this.onTrigger(TriggerOnEvents.ChatMessage, {
          gid: msg.group_id,
          hmsg: await sdk.parseChain(msg.message),
          messageid: msg.message_id,
        })
      }),
      sdk.subscribe('message.private', async (msg) => {
        this.onTrigger(TriggerOnEvents.ChatMessage, {
          uid: msg.user_id,
          hmsg: await sdk.parseChain(msg.message),
          messageid: msg.message_id,
        })
      }),
    ]
  }

  unmount() {
    this.unsubscribes?.forEach(unsubscribe => unsubscribe())
  }
}
