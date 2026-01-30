import { ReplyNode } from '@/src/apps/runtime/core/workflow/nodes/reply-node'
import type { WorkflowThread } from '@/src/apps/runtime/core/workflow/pool'
import type { WillTask } from '@/src/utils/task-pool'
import { Logger } from '@nestjs/common'
export class NcReplyNode extends ReplyNode {
  readonly logger = new Logger(NcReplyNode.name)
  override onThread(thread: WorkflowThread, _nextTask: WillTask): void | Promise<void> {
    this.logger.debug(`Processing thread in ${thread.id}`)
    this.logger.debug(`Msg content: ${thread.kv.hmsg}`)
  }
}
