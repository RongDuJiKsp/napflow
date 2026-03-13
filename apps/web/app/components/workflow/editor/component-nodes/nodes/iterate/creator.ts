import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { ComponentCreator } from '../../types'
import IterateNode from './node'
import IteratePanel from './panel'
import { RiListOrdered2 } from '@remixicon/react'
import { IterateDataSchema } from '@shared/common/workflow/node-data/iterate'
import type { IterateData } from '@shared/common/workflow/node-data/iterate'

export const IterateNodeCreator: ComponentCreator<IterateData> = {
  create: () => ({
    sourceVarName: '',
  }),
  schema: IterateDataSchema,
  label: '迭代',
  icon: RiListOrdered2,
  nodeComponent: IterateNode,
  editPanelComponent: IteratePanel,
  prevNodes: [
    ComponentNodesEnum.Trigger,
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.Loop,
    ComponentNodesEnum.Iterate,
    ComponentNodesEnum.Dify,
  ],
  nextNodes: [
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.Loop,
    ComponentNodesEnum.Iterate,
    ComponentNodesEnum.Dify,
  ],
  env: [],
  isContainer: true,
}
