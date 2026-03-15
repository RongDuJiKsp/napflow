import {
  ComponentNodesEnum,
  VarTypes,
} from '@shared/common/workflow/component-node'
import type { ComponentCreator } from '../../types'
import LoopStartNode from './node'
import LoopStartPanel from './panel'
import { RiPlayLine } from '@remixicon/react'
import { LoopStartDataSchema } from '@shared/common/workflow/node-data/loop-start'
import type { LoopStartData } from '@shared/common/workflow/node-data/loop-start'

export const LoopStartNodeCreator: ComponentCreator<LoopStartData> = {
  create: () => ({}),
  schema: LoopStartDataSchema,
  label: '循环起点',
  icon: RiPlayLine,
  nodeComponent: LoopStartNode,
  editPanelComponent: LoopStartPanel,
  // loop-start 只能作为 loop 节点的子节点，不通过边连接前驱
  prevNodes: [],
  nextNodes: [
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.Loop,
    ComponentNodesEnum.Iterate,
    ComponentNodesEnum.Dify,
    ComponentNodesEnum.JsonRead,
    ComponentNodesEnum.ArrayIndexRead,
  ],
  env: [
    { type: VarTypes.Number, name: 'loop.index' },
    { type: VarTypes.Number, name: 'loop.maxIndex' },
  ],
}
