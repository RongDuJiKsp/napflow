import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { ComponentCreator } from '../../types'
import ArrayIndexReadNode from './node'
import ArrayIndexReadPanel from './panel'
import { RiFileList3Line } from '@remixicon/react'
import {
  type ArrayIndexReadData,
  ArrayIndexReadDataSchema,
} from '@shared/common/workflow/node-data/array-index-read'

export const ArrayIndexReadNodeCreator: ComponentCreator<ArrayIndexReadData> = {
  create: () => ({
    sourceVarName: '',
    index: '',
  }),
  schema: ArrayIndexReadDataSchema,
  label: '数组取索引',
  icon: RiFileList3Line,
  nodeComponent: ArrayIndexReadNode,
  editPanelComponent: ArrayIndexReadPanel,
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
