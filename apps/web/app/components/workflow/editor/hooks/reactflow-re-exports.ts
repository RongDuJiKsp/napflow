import { useReactFlow, useStoreApi } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../types'

export const useAppReactflowFlowStoreApi = () => {
  return useStoreApi<WorkflowNode, WorkflowEdge>()
}
export const useAppReactflowInstance = () => {
  return useReactFlow<WorkflowNode, WorkflowEdge>()
}
