import type { ComponentCreator } from '../../types'
import { RiTimerLine } from '@remixicon/react'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { TimerData } from '@shared/common/workflow/node-data/timer'
import { TimerDataSchema } from '@shared/common/workflow/node-data/timer'
import TimerNode from './node'
import TimerPanel from './panel'

export const TimerNodeCreator: ComponentCreator<TimerData> = {
  create: () => ({
    timeExpr: '',
  }),
  schema: TimerDataSchema,
  label: '定时触发器',
  icon: RiTimerLine,
  nodeComponent: TimerNode,
  editPanelComponent: TimerPanel,
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
}
