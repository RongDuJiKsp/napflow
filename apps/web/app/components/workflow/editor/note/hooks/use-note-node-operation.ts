import { useReactFlow } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../../types'
import { useCallback } from 'react'
import { useCommNodeOperation } from '../../hooks/use-comm-node-operation'
import { NodeClassic } from '@shared/common/workflow/core'
import { type NoteData, NoteDataSchema } from '../type'
import { defineZodCheckWorkflowNodeData } from '@shared/common/workflow/core/workflow-node-data'
import { useStoreImmerCurd } from '../../hooks/use-reactflow-ext'

export const useNoteNodeOperation = () => {
  const { editNode } = useStoreImmerCurd()
  const { deleteNode } = useCommNodeOperation()
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()

  const deleteNoteNode = useCallback((node: WorkflowNode<NoteData>) => {
    deleteNode(node)
  }, [deleteNode])

  const deleteNoteNodeById = useCallback(
    (nodeId: string) => {
      const node = reactflow.getNode(nodeId)
      if (!node || node.type !== NodeClassic.Note) return
      deleteNoteNode(node as WorkflowNode<NoteData>)
    },
    [deleteNoteNode, reactflow],
  )

  const checkedEditNode = useCallback((node: WorkflowNode<NoteData>, data: unknown) => {
    const schema = defineZodCheckWorkflowNodeData<(typeof NoteDataSchema)['shape'], typeof NoteDataSchema>(NoteDataSchema)
    const checkedData = schema.safeParse(data)
    if (!checkedData.success) {
      console.error('Invalid node data:', checkedData.error)
      return
    }
    editNode<WorkflowNode<NoteData>>(node.id, (draft) => {
      draft.data = checkedData.data
    })
  }, [editNode])
  return {
    deleteNoteNodeById,
    checkedEditNode,
  }
}
