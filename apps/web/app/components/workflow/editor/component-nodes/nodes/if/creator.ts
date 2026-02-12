import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { ComponentCreator } from '../../types'
import IfNode from './node'
import IfPanel from './panel'
import { RiGitBranchLine } from '@remixicon/react'
import {
  BranchSchema,
  BranchType,
  CompareOperator,
  CompareOperatorLabels,
  ConditionSchema,
  IfDataSchema,
} from '@shared/common/workflow/node-data/if'
import type { Branch, Condition, IfData } from '@shared/common/workflow/node-data/if'

let branchIdCounter = 0
export const generateBranchId = () => `branch_${Date.now()}_${branchIdCounter++}`

export const IfNodeCreator: ComponentCreator<IfData> = {
  create: () => ({
    branches: [
      {
        id: generateBranchId(),
        type: BranchType.If,
        condition: {
          variable: '',
          operator: CompareOperator.StringEqual,
          value: '',
        },
      },
    ],
  }),
  schema: IfDataSchema,
  label: '条件分支',
  icon: RiGitBranchLine,
  nodeComponent: IfNode,
  editPanelComponent: IfPanel,
  prevNodes: [ComponentNodesEnum.Trigger, ComponentNodesEnum.Reply],
  nextNodes: [ComponentNodesEnum.Reply],
  mutiNextHandles: true,
}
