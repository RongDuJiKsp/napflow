import { TriggerEndpoint, TriggerNode } from '@/src/apps/runtime/core/workflow/nodes/trigger-node'
import type { WorkflowThread } from '@/src/apps/runtime/core/workflow/pool'
import type { WillTask } from '@/src/utils/task-pool'
import { Logger } from '@nestjs/common'

export class NcTriggerNode extends TriggerNode {
  readonly logger = new Logger(NcTriggerNode.name)
  override onThread(thread: WorkflowThread, _nextTask: WillTask, nkv: Record<string, any>): void | Promise<void> {
    this.logger.debug(`Processing thread in ${thread.id}`)
    if(this.data.on === TriggerEndpoint.Group && !thread.kv.gid) {
      this.logger.debug('Task not a group message, exiting')
      _nextTask.abort()
      return
    }
    if(this.data.on === TriggerEndpoint.Friend && !thread.kv.uid) {
      this.logger.debug('Task not a friend message, exiting')
      _nextTask.abort()
      return
    }
    if(this.data.userId && thread.kv.uid !== this.data.userId) {
      this.logger.debug(`Task not a ${this.data.userId} message, exiting`)
      _nextTask.abort()
      return
    }
    if(this.data.groupId && thread.kv.gid !== this.data.groupId) {
      this.logger.debug(`Task not a ${this.data.groupId} message, exiting`)
      _nextTask.abort()
      return
    }
    nkv['trigger.triggerid'] = thread.id
    if(this.data.on === TriggerEndpoint.Group)
      nkv['trigger.uid'] = Number(thread.kv.uid)

    if(this.data.on === TriggerEndpoint.Friend)
      nkv['trigger.gid'] = Number(thread.kv.gid)
    nkv['trigger.messageid'] = thread.kv.messageid
    nkv['trigger.msgreadable'] = thread.kv.hmsg
  }
}
