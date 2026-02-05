import { ReplyNode, ReplyTarget } from '@/src/apps/runtime/core/workflow/nodes/reply-node'
import type { WorkflowThread } from '@/src/apps/runtime/core/workflow/pool'
import type { WillTask } from '@/src/utils/task-pool'
import { Logger } from '@nestjs/common'
import type { NapcatWsSdk } from '../../sdk'
import { compileTemplate } from '@/src/apps/runtime/utils/templates'
import { Structs } from '@rdjksp/node-napcat-ts'
export class NcReplyNode extends ReplyNode {
  readonly logger = new Logger(NcReplyNode.name)
  override onThread(thread: WorkflowThread<NapcatWsSdk>, _nextTask: WillTask, nkv: Record<string, any>): void | Promise<void> {
    this.logger.debug(`Processing thread in ${thread.id}`)
    this.logger.debug(`Msg content: ${thread.kv.hmsg}`)
    const content = compileTemplate(this.data.content, thread)
    this.logger.debug(`Compiled Reply content: ${content}`)
    if(this.data.replyTarget === ReplyTarget.Group && this.data.groupId) {
      this.logger.debug('Replying to group')
      thread.plugin.sdk?.send_group_msg({ group_id: Number(this.data.groupId), message: [Structs.text(content)] })
      return
    }

    if(this.data.replyTarget === ReplyTarget.User)
      this.logger.debug('Replying to user')

    if(this.data.replyTarget === ReplyTarget.triggerSource)
      this.logger.debug('Replying to trigger source')
  }
}
