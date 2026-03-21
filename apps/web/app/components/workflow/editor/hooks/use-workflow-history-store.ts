import type { StoreApi } from 'zustand'
import { createStore } from 'zustand'
import { createParamContext } from '@/utils/react'
import type { WorkflowHistoryStoreShape } from '../store/workflow-history'
import { createWorkflowHistoryStoreShape } from '../store/workflow-history'

type Shape = WorkflowHistoryStoreShape

export const createWorkflowHistoryStore = () =>
  createStore<Shape>((...args) => ({
    ...createWorkflowHistoryStoreShape(...args),
  }))

const {
  context: WorkflowHistoryStoreContext,
  useContextHook: useWorkflowHistoryStore,
} = createParamContext<StoreApi<Shape>>('workflow-history')

export { WorkflowHistoryStoreContext, useWorkflowHistoryStore }

export type { Shape as WorkflowHistoryStateStoreShape }
