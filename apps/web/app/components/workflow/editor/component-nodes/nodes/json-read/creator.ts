import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import type { ComponentCreator } from '../../types'
import JsonReadNode from './node'
import JsonReadPanel from './panel'
import { RiFileList3Line } from '@remixicon/react'
import {
  type JsonReadData,
  JsonReadDataSchema,
} from '@shared/common/workflow/node-data/json-read'

export const JsonReadNodeCreator: ComponentCreator<JsonReadData> = {
  create: () => ({
    sourceVarName: '',
    outputs: [],
  }),
  schema: JsonReadDataSchema,
  label: 'JSON取字段',
  icon: RiFileList3Line,
  nodeComponent: JsonReadNode,
  editPanelComponent: JsonReadPanel,
  prevNodes: [
    ComponentNodesEnum.Trigger,
    ComponentNodesEnum.Timer,
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
  env: [],
}
