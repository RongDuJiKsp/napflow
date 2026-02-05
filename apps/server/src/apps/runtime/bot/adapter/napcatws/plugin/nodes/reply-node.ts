import { ReplyNode, ReplyTarget } from '@/src/apps/runtime/core/workflow/nodes/reply-node'
import type { WorkflowThread } from '@/src/apps/runtime/core/workflow/pool'
import type { WillTask } from '@/src/utils/task-pool'
import { Logger } from '@nestjs/common'
import type { NapcatWsSdk } from '../../sdk'
export class NcReplyNode extends ReplyNode {
  readonly logger = new Logger(NcReplyNode.name)
  override onThread(thread: WorkflowThread<NapcatWsSdk>, _nextTask: WillTask, nkv: Record<string, any>): void | Promise<void> {
    this.logger.debug(`Processing thread in ${thread.id}`)
    this.logger.debug(`Msg content: ${thread.kv.hmsg}`)
    if(this.data.replyTarget === ReplyTarget.Group)
      this.logger.debug('Replying to group')

    if(this.data.replyTarget === ReplyTarget.User)
      this.logger.debug('Replying to user')

    if(this.data.replyTarget === ReplyTarget.triggerSource)
      this.logger.debug('Replying to trigger source')
  }
}
