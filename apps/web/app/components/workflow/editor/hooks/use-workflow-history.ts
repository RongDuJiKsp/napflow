import { useWorkflowHistoryStore } from './use-workflow-history-store'
import { useCallback } from 'react'
import { useWorkflowExtStore } from './use-workflow-ext-state'
import { type WorkflowEditorHistoryState, WorkflowHistoryActionTag } from '../store/workflow-history'
import { useAppReactflowFlowStoreApi } from './reactflow-re-exports'

export const useWorkflowHistory = () => {
  const workflowStore = useAppReactflowFlowStoreApi()
  const workflowExtStore = useWorkflowExtStore()
  const historyStore = useWorkflowHistoryStore()

  const override = useCallback(({ nodes, edges, envs }: WorkflowEditorHistoryState, actionMsg?: string) => {
    const { nodes: currNodes, edges: currEdges, setNodes, setEdges } = workflowStore.getState()
    const { envs: currEnvs, setEnvs } = workflowExtStore.getState()
    const { setHistoryState } = historyStore.getState()
    // save current state to history
    setHistoryState({
      nodes: currNodes, edges: currEdges, envs: currEnvs, actionTag: WorkflowHistoryActionTag.Current,
    })
    // save new state to history
    setHistoryState({
      nodes, edges, envs, actionTag: WorkflowHistoryActionTag.Programme, title: actionMsg,
    })
    setNodes(nodes)
    setEdges(edges)
    setEnvs(envs)
  }, [historyStore, workflowStore, workflowExtStore])

  const redo = useCallback((steps?: number) => {
    const { redo } = historyStore.temporal.getState()
    redo(steps)
  }, [historyStore])

  const undo = useCallback((steps?: number) => {
    const { undo } = historyStore.temporal.getState()
    undo(steps)
  }, [historyStore])

  return {
    override,
    redo,
    undo,
  }
}
