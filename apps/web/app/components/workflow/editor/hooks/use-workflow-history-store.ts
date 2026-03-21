import { createStore } from 'zustand'
import { createParamContext } from '@/utils/react'
import type { WorkflowHistoryStoreShape } from '../store/workflow-history'
import { createWorkflowHistoryStoreShape } from '../store/workflow-history'

type Shape = WorkflowHistoryStoreShape

export const createWorkflowHistoryStore = () =>
  createStore(createWorkflowHistoryStoreShape)

const {
  context: WorkflowHistoryStoreContext,
  useContextHook: useWorkflowHistoryStore,
} = createParamContext<ReturnType<typeof createWorkflowHistoryStore>>('workflow-history')

export { WorkflowHistoryStoreContext, useWorkflowHistoryStore }

export type { Shape as WorkflowHistoryStateStoreShape }
