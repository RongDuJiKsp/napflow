import type { WorkflowNode } from '@/test/utils'
import type { Var } from '@shared/common/workflow/core/component-node'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { useNodes } from '@xyflow/react'
import {
  getIterateStartOutputVar,
  useComponentNodeEnv,
} from '../../../hooks/use-component-node-env'
import { safeAssertWorkflowNodeAsComponentNode } from '../../../utils/node-asserts'

export const useIterateStartOutputVars = (id: string): Var[] => {
  const nodes = useNodes<WorkflowNode>()
  const currentNode = nodes.find(n => n.id === id)
  const parentNode = nodes.find(n => n.id === currentNode?.parentId)
  const { vars } = useComponentNodeEnv(parentNode?.id || '')
  const parentIteratorNode = safeAssertWorkflowNodeAsComponentNode(
    ComponentNodesEnum.Iterate,
    parentNode,
  )
  if (!parentIteratorNode) return []
  const outputVar = getIterateStartOutputVar(parentIteratorNode, vars)
  return [outputVar].filter(Boolean) as Var[]
}
