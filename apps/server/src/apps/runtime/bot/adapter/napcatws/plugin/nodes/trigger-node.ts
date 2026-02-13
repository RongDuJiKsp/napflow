import { TriggerNode } from '@/src/apps/runtime/core/workflow/nodes/trigger-node'
import { TriggerOn } from '@shared/common/workflow/node-data/trigger'
import type { WorkflowThread } from '@/src/apps/runtime/core/workflow/pool'
import type { WillTask } from '@/src/utils/task-pool'
import { Logger } from '@nestjs/common'
import { compileTemplate } from '@/src/apps/runtime/utils/templates'

export class NcTriggerNode extends TriggerNode {
  readonly logger = new Logger(NcTriggerNode.name)
  override onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    nkv: Record<string, any>,
  ): void | Promise<void> {
    const uid = compileTemplate(this.data.userId ?? '', thread)
    const gid = compileTemplate(this.data.groupId ?? '', thread)
    this.logger.debug(`Processing thread in ${thread.id}`)
    if (this.data.on === TriggerOn.Group && !thread.kv.gid) {
      this.logger.debug('Task not a group message, exiting')
      _nextTask.abort()
      return
    }
    if (this.data.on === TriggerOn.Friend && !thread.kv.uid) {
      this.logger.debug('Task not a friend message, exiting')
      _nextTask.abort()
      return
    }
    if (
      this.data.on === TriggerOn.Friend
      && thread.kv.uid !== uid
    ) {
      this.logger.debug(
        `Task not a friend ${uid} message(${thread.kv.uid}), exiting`,
      )
      _nextTask.abort()
      return
    }
    if (
      this.data.on === TriggerOn.Group
      && thread.kv.gid !== gid
    ) {
      this.logger.debug(
        `Task not a group ${gid} message(${thread.kv.gid}), exiting`,
      )
      _nextTask.abort()
      return
    }
    nkv['trigger.triggerid'] = this.id
    if (this.data.on === TriggerOn.Group)
      nkv['trigger.gid'] = Number(thread.kv.gid)

    if (this.data.on === TriggerOn.Friend)
      nkv['trigger.uid'] = Number(thread.kv.uid)
    nkv['trigger.messageid'] = thread.kv.messageid
    nkv['trigger.msgreadable'] = thread.kv.hmsg
  }
}
