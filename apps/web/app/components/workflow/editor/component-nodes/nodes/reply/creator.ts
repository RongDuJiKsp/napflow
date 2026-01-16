import z from 'zod'
import { type ComponentCreator, ComponentNodesEnum } from '../../types'
import ReplyNode from './node'
import ReplyPanel from './panel'
import { RiQuestionAnswerLine } from '@remixicon/react'

const ReplyShemaData = z.object({
  content: z.string(),
})
export type ReplyData = z.infer<typeof ReplyShemaData>

export const ReplyNodeCreator: ComponentCreator<ReplyData> = {
  create: () => ({
    content: '',
  }),
  schema: ReplyShemaData,
  label: '回复',
  icon: RiQuestionAnswerLine,
  nodeComponent: ReplyNode,
  editPanelComponent: ReplyPanel,
  prevNodes: [ComponentNodesEnum.Trigger, ComponentNodesEnum.Reply],
  nextNodes: [ComponentNodesEnum.Reply],
}
