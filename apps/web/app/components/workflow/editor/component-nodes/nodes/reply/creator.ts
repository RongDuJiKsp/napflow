import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { ComponentCreator } from '../../types'
import ReplyNode from './node'
import ReplyPanel from './panel'
import { RiQuestionAnswerLine } from '@remixicon/react'
import {
  ReplyDataSchema,
  ReplyTarget,
} from '@shared/common/workflow/node-data/reply'
import type { ReplyData } from '@shared/common/workflow/node-data/reply'

export const ReplyNodeCreator: ComponentCreator<ReplyData> = {
  create: () => ({
    content: '',
    replyTarget: ReplyTarget.triggerSource,
  }),
  schema: ReplyDataSchema,
  label: '回复',
  icon: RiQuestionAnswerLine,
  nodeComponent: ReplyNode,
  editPanelComponent: ReplyPanel,
  prevNodes: [
    ComponentNodesEnum.Trigger,
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.LoopStart,
  ],
  nextNodes: [
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.Loop,
  ],
}
