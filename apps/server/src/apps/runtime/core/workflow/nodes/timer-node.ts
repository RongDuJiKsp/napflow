import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import { TimerDataSchema } from '@shared/common/workflow/node-data/timer'
import type z from 'zod'
import type { CommNodeType, CommTrigger } from '../node'
import { TriggerOnEvents } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WillTask } from '@/src/utils/task-pool'
import type { WorkflowThread } from '../pool'
import { Logger } from '@nestjs/common'
export const TimerDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  TimerDataSchema.shape,
)
export type TimerDataCtx = z.infer<typeof TimerDataCtxSchema>
export class TimerNode extends CommNode<TimerDataCtx> implements CommTrigger {
  readonly role = CommNodeRole.Trigger
  readonly triggerEv: TriggerOnEvents = TriggerOnEvents.Timer
  private readonly logger = new Logger(TimerNode.name)

  constructor(data: CommNodeType<TimerDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    nextTask: WillTask,
    nkv: Record<string, any>,
  ): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
}
