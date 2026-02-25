import { useReactFlow } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../../types'
import { useCallback } from 'react'
import { useCommNodeOperation } from '../../hooks/use-comm-node-operation'
import { NodeClassic } from '@shared/common/workflow/core'

export const useNoteNodeOperation = () => {
  const { deleteNode } = useCommNodeOperation()
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const deleteNoteNode = useCallback((nodeId: string) => {
    const node = reactflow.getNode(nodeId)
    if (!node || node.type !== NodeClassic.Note) return
    deleteNode(node)
  }, [deleteNode, reactflow])
  return {
    deleteNoteNode,
  }
}
