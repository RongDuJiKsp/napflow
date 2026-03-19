import type { ComponentCreator } from '../../types'
import { RiTimerLine } from '@remixicon/react'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import {
  type TimerData,
  TimerDataSchema,
  TimerTriggerMode,
} from '@shared/common/workflow/node-data/timer'
import TimerNode from './node'
import TimerPanel from './panel'

export const TimerNodeCreator: ComponentCreator<TimerData> = {
  create: () => ({
    mode: TimerTriggerMode.Schedule,
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
