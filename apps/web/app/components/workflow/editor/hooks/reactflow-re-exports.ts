import type { ReactFlowState } from '@xyflow/react'
import { useReactFlow, useStore, useStoreApi } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../types'

export const useWorkflowStoreApi = () => {
  return useStoreApi<WorkflowNode, WorkflowEdge>()
}
export const useWorkflowEditorInstance = () => {
  return useReactFlow<WorkflowNode, WorkflowEdge>()
}

export const useWorkflowStore = <Selected>(
  selector: (state: ReactFlowState<WorkflowNode, WorkflowEdge>) => Selected,
  equalityFn?: (a: Selected, b: Selected) => boolean,
) => {
  return useStore<Selected>(
    state =>
      selector(state as unknown as ReactFlowState<WorkflowNode, WorkflowEdge>),
    equalityFn,
  )
}
