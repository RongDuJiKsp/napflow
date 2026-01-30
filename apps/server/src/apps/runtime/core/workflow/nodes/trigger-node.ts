import z from 'zod'
import type { CommNodeType } from '../node'
import { CommNodeRole } from '../node'
import { CommNode } from '../node'
import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'

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

export class TriggerNode extends CommNode<TriggerData> {
  readonly role: CommNodeRole = CommNodeRole.Trigger
  constructor(data: CommNodeType<TriggerData>) {
    super(data)
  }
}
