import z from 'zod'
import type { CommNodeType, CommTrigger } from '../node'
import { CommNodeRole, TriggerOnEvents } from '../node'
import { CommNode } from '../node'
import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { raiseErrors } from '../../../utils/errors'

export enum TriggerEndpoint {
  Group = 'group',
  Friend = 'friend',
}
export const TriggerDataSchema = ZodCheckComponentNodeMeta.extend({
  on: z.enum(TriggerEndpoint),
  userId: z.string().optional(),
  groupId: z.string().optional(),
})
export type TriggerData = z.infer<typeof TriggerDataSchema>

export class TriggerNode extends CommNode<TriggerData> implements CommTrigger {
  readonly role = CommNodeRole.Trigger
  readonly triggerEv: TriggerOnEvents = TriggerOnEvents.ChatMessage

  constructor(data: CommNodeType<TriggerData>) {
    super(data)
  }

  onThread(thread: WorkflowThread, _nextTask: WillTask, _nkv: Record<string, any>): void | Promise<void> {
    raiseErrors(thread, TriggerNode)
  }
}
