import { CommPlugin } from '@/src/apps/runtime/core/workflow/pool'
import type { Edge, Node } from '@shared/common/workflow/core'
import { NcKlassMap } from './constant'
import { TriggerOnEvents } from '@/src/apps/runtime/core/workflow/node'
import type { NapcatWsSdk } from '../sdk'
import type { Var } from '@shared/common/workflow/core/component-node'
import type { BotWorkflowAppBindingConfig } from '@shared/common/bot/core/config'
import { RegisterManager } from '@/src/utils/service-manager'
import { MinusTimePoller } from '@/src/utils/task-pool'

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
  private readonly minusPoller = new MinusTimePoller()

  mount(sdk: NapcatWsSdk) {
    super.mount(sdk)
    this.minusPoller.mount()
    // 监听群消息和私聊消息
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
    // 监听定时器触发
    this.minusPoller.register((seq) => {
      this.onTrigger(TriggerOnEvents.Timer, {
        time: String(this.minusPoller.realTime(seq) * 60),
        mountAt: String(this.minusPoller.realMountTime(seq) * 60),
        uptime: String(this.minusPoller.uptimeTs),
      })
    })
  }

  unmount() {
    this.registerManager.clear()
    this.minusPoller.unmount()
    super.unmount()
  }
}
