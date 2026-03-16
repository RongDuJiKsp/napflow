import { CommPlugin } from '@/src/apps/runtime/core/workflow/pool'
import type { Edge, Node } from '@shared/common/workflow/core'
import { NcKlassMap } from './constant'
import { TriggerOnEvents } from '@/src/apps/runtime/core/workflow/node'
import type { NapcatWsSdk } from '../sdk'
import type { Var } from '@shared/common/workflow/component-node'
import type { BotWorkflowAppBindingConfig } from '@shared/common/bot/adapter'
import { RegisterManager } from '@/src/utils/registerbale'

export class NapcatWsTriggerPlugin extends CommPlugin<NapcatWsSdk> {
  constructor(
    nodes: Node[],
    edges: Edge[],
    env: Var[],
    bindingCfg: BotWorkflowAppBindingConfig,
  ) {
    super(nodes, edges, env, bindingCfg, NcKlassMap)
  }

  private readonly registerManager = new RegisterManager()

  mount(sdk: NapcatWsSdk) {
    super.mount(sdk)
    this.registerManager.register(
      sdk.subscribe('message.group', async (msg) => {
        this.onTrigger(TriggerOnEvents.ChatMessage, {
          gid: String(msg.group_id),
          hmsg: await sdk.parseChain(msg.message),
          messageid: String(msg.message_id),
          senderuid: String(msg.sender.user_id),
        })
      }),
    )
    this.registerManager.register(
      sdk.subscribe('message.private', async (msg) => {
        this.onTrigger(TriggerOnEvents.ChatMessage, {
          uid: String(msg.user_id),
          hmsg: await sdk.parseChain(msg.message),
          messageid: String(msg.message_id),
          senderuid: String(msg.sender.user_id),
        })
      }),
    )
  }

  unmount() {
    this.registerManager.clear()
    super.unmount()
  }
}
