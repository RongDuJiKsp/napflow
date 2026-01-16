import { useCallback } from 'react'
import type { ComponentNode } from '../types'
import { ComponentNodeCreatorMap } from '../constants'
import { useReactFlow } from '@xyflow/react'
import { createWorkflowEdge } from '../../utils/nodes'
import type { WorkflowEdge, WorkflowNode } from '../../types'
import { useStoreImmerCurd } from '../../hooks/use-reactflow-ext'

export const useComponentNodeOperations = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { editNode } = useStoreImmerCurd()
  const handleConnenct = useCallback(
    (source: ComponentNode, target: ComponentNode) => {
      const sourceCreator = ComponentNodeCreatorMap[source.data.type]
      const targetCreator = ComponentNodeCreatorMap[target.data.type]
      if (
        !sourceCreator.nextNodes?.includes(target.data.type)
        || !targetCreator.prevNodes?.includes(source.data.type)
      )
        return
      reactflow.addEdges(
        createWorkflowEdge({ source: source.id, target: target.id }),
      )
    },
    [reactflow],
  )
  const handleDeleteNode = useCallback(
    (node: ComponentNode) => {
      reactflow.setEdges(edges =>
        edges.filter(e => e.source !== node.id && e.target !== node.id),
      )
      reactflow.setNodes(nodes => nodes.filter(n => n.id !== node.id))
    },
    [reactflow],
  )
  const handleFoldUnfoldNode = useCallback(
    (node: ComponentNode) => {
      editNode<ComponentNode>(node.id, (draft) => {
        draft.data.expanded = !draft.data.expanded
      })
    },
    [editNode],
  )
  return {
    handleConnenct,
    handleDeleteNode,
    handleFoldUnfoldNode,
  }
}
