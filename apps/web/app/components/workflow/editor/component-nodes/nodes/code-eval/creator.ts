import { ComponentNodesEnum, VarTypes } from '@shared/common/workflow/core/component-node'
import type { ComponentCreator } from '../../types'
import CodeEvalNode from './node'
import CodeEvalPanel from './panel'
import { RiCodeSSlashLine } from '@remixicon/react'
import {
  type CodeEvalData,
  CodeEvalDataSchema,
} from '@shared/common/workflow/node-data/code-eval'

export const CodeEvalNodeCreator: ComponentCreator<CodeEvalData> = {
  create: () => ({
    code: 'function doit(...args) {\n  \n}',
    args: [],
  }),
  schema: CodeEvalDataSchema,
  label: '代码执行',
  icon: RiCodeSSlashLine,
  nodeComponent: CodeEvalNode,
  editPanelComponent: CodeEvalPanel,
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
    ComponentNodesEnum.CodeEval,
  ],
  nextNodes: [
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.Loop,
    ComponentNodesEnum.Iterate,
    ComponentNodesEnum.Dify,
    ComponentNodesEnum.JsonRead,
    ComponentNodesEnum.ArrayIndexRead,
    ComponentNodesEnum.CodeEval,
  ],
  env: [{ type: VarTypes.String, name: 'result' }],
}
