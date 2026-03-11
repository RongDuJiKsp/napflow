import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import type { WorkflowEdge, WorkflowNode } from '../types'

export const useCommNodeOperation = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const deleteNodeById = useCallback(
    (nodeId: string) => {
      reactflow.setEdges(edges =>
        edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      )
      reactflow.setNodes(nodes => nodes.filter(n => n.id !== nodeId))
    },
    [reactflow],
  )
  const deleteNode = useCallback(
    (node: WorkflowNode) => {
      deleteNodeById(node.id)
    },
    [deleteNodeById],
  )

  return {
    deleteNodeById,
    deleteNode,
  }
}

export const useCommContainerNodeOperation = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const deleteNodeAndChildrenById = useCallback(
    (nodeId: string) => {
      const nodes = reactflow.getNodes()
      const edges = reactflow.getEdges()
      const targetNodes = new Set(
        nodes
          .filter(n => n.parentId === nodeId || n.id === nodeId)
          .map(n => n.id),
      )
      const targetEdges = new Set(
        edges
          .filter(e => targetNodes.has(e.source) || targetNodes.has(e.target))
          .map(e => e.id),
      )
      reactflow.setEdges(edges =>
        edges.filter(e => !targetEdges.has(e.id)),
      )
      reactflow.setNodes(nodes =>
        nodes.filter(n => !targetNodes.has(n.id)),
      )
    },
    [reactflow],
  )

  const deleteNodeAndChildren = useCallback(
    (node: WorkflowNode) => {
      deleteNodeAndChildrenById(node.id)
    },
    [deleteNodeAndChildrenById],
  )

  return {
    deleteNodeAndChildrenById,
    deleteNodeAndChildren,
  }
}
