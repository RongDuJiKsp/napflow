import { ReplyNode, ReplyTarget } from '@/src/apps/runtime/core/workflow/nodes/reply-node'
import type { WorkflowThread } from '@/src/apps/runtime/core/workflow/pool'
import type { WillTask } from '@/src/utils/task-pool'
import { Logger } from '@nestjs/common'
import type { NapcatWsSdk } from '../../sdk'
import { compileTemplate } from '@/src/apps/runtime/utils/templates'
import { Structs } from '@rdjksp/node-napcat-ts'
export class NcReplyNode extends ReplyNode {
  readonly logger = new Logger(NcReplyNode.name)
  override async onThread(thread: WorkflowThread<NapcatWsSdk>, _nextTask: WillTask, _nkv: Record<string, any>): Promise<void> {
    this.logger.debug(`Processing thread in ${thread.id}`)
    this.logger.debug(`Msg content: ${thread.kv.hmsg}`)
    await this.compileAndReply(this.data.content, thread)
  }

  async compileAndReply(template: string, thread: WorkflowThread<NapcatWsSdk>): Promise<void> {
    const content = compileTemplate(template, thread)
    this.logger.debug(`Compiled Reply content: ${content}`)
    if(this.data.replyTarget === ReplyTarget.Group && this.data.groupId) {
      this.logger.debug('Replying to group')
      await this.replyToGroup(thread, this.data.groupId, content)
    }
    else if(this.data.replyTarget === ReplyTarget.User && this.data.userId) {
      this.logger.debug('Replying to user')
      await this.replyToUser(thread, this.data.userId, content)
    }
    else if(this.data.replyTarget === ReplyTarget.triggerSource && this.data.triggerSourceId) {
      this.logger.debug('Replying to trigger source')
      const triggerSourceId = compileTemplate(this.data.triggerSourceId, thread)
      const sourceKv = thread.nodeKv[triggerSourceId]

      if(sourceKv['trigger.uid'])
        await this.replyToUser(thread, sourceKv['trigger.uid'], content)
      else if(sourceKv['trigger.gid'])
        await this.replyToGroup(thread, sourceKv['trigger.gid'], content)
      else
        this.logger.warn('Not Hit any reply target in reply source')
    }
    else{
      this.logger.warn('Not Hit any reply target')
    }
  }

  async replyToGroup(thread: WorkflowThread<NapcatWsSdk>, groupId: string, content: string): Promise<void> {
    await thread.plugin.sdk?.send_group_msg({ group_id: Number(groupId), message: [Structs.text(content)] })
  }

  async replyToUser(thread: WorkflowThread<NapcatWsSdk>, userId: string, content: string): Promise<void> {
    await thread.plugin.sdk?.send_private_msg({ user_id: Number(userId), message: [Structs.text(content)] })
  }
}
