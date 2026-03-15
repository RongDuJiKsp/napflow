import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { ComponentCreator } from '../../types'
import LoopNode from './node'
import LoopPanel from './panel'
import { RiLoopLeftLine } from '@remixicon/react'
import { LoopDataSchema } from '@shared/common/workflow/node-data/loop'
import type { LoopData } from '@shared/common/workflow/node-data/loop'

export const LoopNodeCreator: ComponentCreator<LoopData> = {
  create: () => ({
    maxCount: 3,
  }),
  schema: LoopDataSchema,
  label: '循环',
  icon: RiLoopLeftLine,
  nodeComponent: LoopNode,
  editPanelComponent: LoopPanel,
  prevNodes: [
    ComponentNodesEnum.Trigger,
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.Iterate,
    ComponentNodesEnum.IterateStart,
    ComponentNodesEnum.Dify,
    ComponentNodesEnum.JsonRead,
    ComponentNodesEnum.ArrayIndexRead,
  ],
  nextNodes: [
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.Loop,
    ComponentNodesEnum.Iterate,
    ComponentNodesEnum.Dify,
    ComponentNodesEnum.JsonRead,
    ComponentNodesEnum.ArrayIndexRead,
  ],
  env: [],
  isContainer: true,
}
