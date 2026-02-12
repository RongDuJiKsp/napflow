import type z from 'zod'
import type { CommNodeType, CommTrigger } from '../node'
import { CommNodeRole, TriggerOnEvents } from '../node'
import { CommNode } from '../node'
import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { raiseErrors } from '../../../utils/errors'
import { TriggerDataRawSchema } from '@shared/common/workflow/node-data/trigger'

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const TriggerDataCtxSchema = ZodCheckComponentNodeMeta.extend(TriggerDataRawSchema.shape)

export type TriggerDataCtx = z.infer<typeof TriggerDataCtxSchema>

export class TriggerNode extends CommNode<TriggerDataCtx> implements CommTrigger {
  readonly role = CommNodeRole.Trigger
  readonly triggerEv: TriggerOnEvents = TriggerOnEvents.ChatMessage

  constructor(data: CommNodeType<TriggerDataCtx>) {
    super(data)
  }

  onThread(thread: WorkflowThread, _nextTask: WillTask, _nkv: Record<string, any>): void | Promise<void> {
    raiseErrors(thread, TriggerNode)
  }
}
