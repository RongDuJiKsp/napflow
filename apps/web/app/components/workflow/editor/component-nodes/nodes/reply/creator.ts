import z from 'zod'
import { type ComponentCreator, ComponentNodesEnum } from '../../types'
import ReplyNode from './node'
import ReplyPanel from './panel'
import { RiQuestionAnswerLine } from '@remixicon/react'

export enum ReplyTarget {
  User = 'user',
  Group = 'group',
  triggerSource = 'triggerSource',
}
const ReplyShemaData = z.object({
  content: z.string(),
  replyTarget: z.enum(ReplyTarget),
  userId: z.string().optional(),
  groupId: z.string().optional(),
  triggerSourceId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.replyTarget === ReplyTarget.User) {
    if (!data.userId) {
      ctx.addIssue({
        code: 'custom',
        message: '请选择回复目标',
      })
    }
  }
  if (data.replyTarget === ReplyTarget.Group) {
    if (!data.groupId) {
      ctx.addIssue({
        code: 'custom',
        message: '请选择回复目标',
      })
    }
  }
  if (data.replyTarget === ReplyTarget.triggerSource) {
    if (!data.triggerSourceId) {
      ctx.addIssue({
        code: 'custom',
        message: '请选择回复目标',
      })
    }
  }
})
export type ReplyData = z.infer<typeof ReplyShemaData>

export const ReplyNodeCreator: ComponentCreator<ReplyData> = {
  create: () => ({
    content: '',
    replyTarget: ReplyTarget.triggerSource,
  }),
  schema: ReplyShemaData,
  label: '回复',
  icon: RiQuestionAnswerLine,
  nodeComponent: ReplyNode,
  editPanelComponent: ReplyPanel,
  prevNodes: [ComponentNodesEnum.Trigger, ComponentNodesEnum.Reply],
  nextNodes: [ComponentNodesEnum.Reply],
}
