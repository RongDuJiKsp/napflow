import { useWorkflowHistoryStore } from './use-workflow-history-store'
import { useCallback } from 'react'
import { useWorkflowExtStore } from './use-workflow-ext-state'
import {
  type WorkflowEditorHistoryState,
  WorkflowHistoryActionTag,
} from '../store/workflow-history'
import { useAppReactflowFlowStoreApi } from './reactflow-re-exports'
import { useStore } from 'zustand'

export const useWorkflowHistory = () => {
  const workflowStore = useAppReactflowFlowStoreApi()
  const workflowExtStore = useWorkflowExtStore()
  const historyStore = useWorkflowHistoryStore()
  const title = useStore(historyStore, state => state.title)

  const canUndo = useStore(
    historyStore.temporal,
    state =>
      state.pastStates.filter(
        c =>
          c.actionTag
          && ![
            WorkflowHistoryActionTag.Initial,
            WorkflowHistoryActionTag.UnInitial,
          ].includes(c.actionTag),
      ).length > 0,
  )
  const canRedo = useStore(
    historyStore.temporal,
    state => state.futureStates.length > 0,
  )

  const captureSnapshot = useCallback(
    (title?: string, tag?: WorkflowHistoryActionTag) => {
      const { nodes, edges } = workflowStore.getState()
      const { envs } = workflowExtStore.getState()
      const { setHistoryState } = historyStore.getState()
      const { pastStates } = historyStore.temporal.getState()
      // 如果没有历史记录了，说明这是第一次保存历史记录，则update上一条为Initial
      const actionTag
        = tag
        ?? (pastStates.length
          ? WorkflowHistoryActionTag.Snapshot
          : WorkflowHistoryActionTag.Initial)
      // save current state to history
      setHistoryState({
        nodes,
        edges,
        envs,
        actionTag,
        title,
      })
    },
    [historyStore, workflowExtStore, workflowStore],
  )

  // override 保存当前状态到 history，并将传入的状态设置到 workflow
  const override = useCallback(
    (
      { nodes, edges, envs }: WorkflowEditorHistoryState,
      actionMsg?: string,
    ) => {
      captureSnapshot()
      // save new state to history
      const { setNodes, setEdges } = workflowStore.getState()
      const { setEnvs } = workflowExtStore.getState()
      const { setHistoryState } = historyStore.getState()
      setHistoryState({
        nodes,
        edges,
        envs,
        actionTag: WorkflowHistoryActionTag.Override,
        title: actionMsg,
      })
      setNodes(nodes)
      setEdges(edges)
      setEnvs(envs)
    },
    [historyStore, workflowStore, workflowExtStore, captureSnapshot],
  )

  const capture = useCallback(
    <Fn extends (...args: any[]) => any>(actionMsg: string, action: Fn) => {
      captureSnapshot()
      const ret = action()
      captureSnapshot(actionMsg, WorkflowHistoryActionTag.Programmatic)
      return ret
    },
    [captureSnapshot],
  )

  const redo = useCallback(
    (steps?: number) => {
      const { redo } = historyStore.temporal.getState()
      redo(steps)
      const { setNodes, setEdges } = workflowStore.getState()
      const { setEnvs } = workflowExtStore.getState()
      const { nodes, edges, envs } = historyStore.getState()
      setNodes(nodes)
      setEdges(edges)
      setEnvs(envs)
    },
    [historyStore, workflowExtStore, workflowStore],
  )

  const undo = useCallback(
    (steps?: number) => {
      const { undo } = historyStore.temporal.getState()
      undo(steps)
      const { setNodes, setEdges } = workflowStore.getState()
      const { setEnvs } = workflowExtStore.getState()
      const { nodes, edges, envs } = historyStore.getState()
      setNodes(nodes)
      setEdges(edges)
      setEnvs(envs)
    },
    [historyStore, workflowExtStore, workflowStore],
  )

  return {
    capture,
    override,
    redo,
    undo,
    canUndo,
    canRedo,
    title,
  }
}
