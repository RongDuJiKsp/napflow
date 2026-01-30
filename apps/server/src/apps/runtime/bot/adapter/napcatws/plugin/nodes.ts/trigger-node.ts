import { TriggerNode } from '@/src/apps/runtime/core/workflow/nodes/trigger-node'
import type { WorkflowThread } from '@/src/apps/runtime/core/workflow/pool'
import type { WillTask } from '@/src/utils/task-pool'
import { Logger } from '@nestjs/common'

export class NcTriggerNode extends TriggerNode {
  readonly logger = new Logger(NcTriggerNode.name)
  override onThread(thread: WorkflowThread, _nextTask: WillTask): void | Promise<void> {
    this.logger.debug(`Processing thread in ${thread.id}`)
  }
}
