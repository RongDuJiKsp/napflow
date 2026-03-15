import {
  ComponentNodesEnum,
  VarTypes,
} from '@shared/common/workflow/component-node'
import type { ComponentCreator } from '../../types'
import IterateStartNode from './node'
import IterateStartPanel from './panel'
import { RiPlayLine } from '@remixicon/react'
import { IterateStartDataSchema } from '@shared/common/workflow/node-data/iterate-start'
import type { IterateStartData } from '@shared/common/workflow/node-data/iterate-start'

export const IterateStartNodeCreator: ComponentCreator<IterateStartData> = {
  create: () => ({}),
  schema: IterateStartDataSchema,
  label: '迭代起点',
  icon: RiPlayLine,
  nodeComponent: IterateStartNode,
  editPanelComponent: IterateStartPanel,
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
  env: [{ type: VarTypes.String, name: 'iter.item' }],
}
