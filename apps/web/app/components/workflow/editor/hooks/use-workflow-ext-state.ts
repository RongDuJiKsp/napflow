import type { StoreApi } from 'zustand'
import { createStore } from 'zustand'
import type { WorkflowEnvStoreShape } from '../store/workflow-env'
import { createWorkflowEnvStore } from '../store/workflow-env'
import { createParamContext } from '@/utils/react'

type Shape = WorkflowEnvStoreShape

export const createWorkflowExtStateStore = () =>
  createStore<Shape>((...args) => ({
    ...createWorkflowEnvStore(...args),
  }))

const {
  context: WorkflowExtStoreContext,
  useContextHook: useWorkflowExtStore,
} = createParamContext<StoreApi<Shape>>('workflow-ext-state')

export { WorkflowExtStoreContext, useWorkflowExtStore }

export type { Shape as WorkflowExtStateStoreShape }
