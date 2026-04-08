import { useReactFlow, useStoreApi } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../types'

export const useWorkflowStoreApi = () => {
  return useStoreApi<WorkflowNode, WorkflowEdge>()
}
export const useWorkflowEditorInstance = () => {
  return useReactFlow<WorkflowNode, WorkflowEdge>()
}
