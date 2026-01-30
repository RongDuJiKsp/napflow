import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'

export enum ReplyTarget {
  User = 'user',
  Group = 'group',
  triggerSource = 'triggerSource',
}
export const ReplyDataSchema = ZodCheckComponentNodeMeta.extend({
  content: z.string(),
  replyTarget: z.enum(ReplyTarget),
  userId: z.string().optional(),
  groupId: z.string().optional(),
  triggerSourceId: z.string().optional(),
})
export type ReplyData = z.infer<typeof ReplyDataSchema>

export class ReplyNode extends CommNode<ReplyData> {
  readonly role: CommNodeRole = CommNodeRole.Action
  constructor(data: CommNodeType<ReplyData>) {
    super(data)
  }
}
