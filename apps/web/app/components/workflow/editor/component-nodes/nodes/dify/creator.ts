import { ComponentNodesEnum, VarTypes } from '@shared/common/workflow/component-node'
import type { ComponentCreator } from '../../types'
import DifyNode from './node'
import DifyPanel from './panel'
import { RiRobot2Line } from '@remixicon/react'
import { DifyDataSchema, DifyMode } from '@shared/common/workflow/node-data/dify'
import type { DifyData } from '@shared/common/workflow/node-data/dify'

export const DifyNodeCreator: ComponentCreator<DifyData> = {
  create: () => ({
    mode: DifyMode.Chatflow,
    baseUrl: '',
    apiKey: '',
    query: '',
    inputs: [],
  }),
  schema: DifyDataSchema,
  label: '访问 Dify',
  icon: RiRobot2Line,
  nodeComponent: DifyNode,
  editPanelComponent: DifyPanel,
  prevNodes: [
    ComponentNodesEnum.Trigger,
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.LoopStart,
    ComponentNodesEnum.IterateStart,
    ComponentNodesEnum.Loop,
    ComponentNodesEnum.Iterate,
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
  env: [
    { type: VarTypes.String, name: 'output' },
  ],
}
