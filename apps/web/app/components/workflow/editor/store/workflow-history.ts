import type { Var } from '@shared/common/workflow/core/component-node'
import type { WorkflowEdge, WorkflowNode } from '../types'
import isDeepEqual from 'fast-deep-equal'
import { temporal } from 'zundo'
type WorkflowHistoryState = {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  envs: Var[];
}

type WorkflowHistoryAction = {
  getState: () => WorkflowHistoryState;
  setState: (state: WorkflowHistoryState) => void;
}

export type WorkflowHistoryStoreShape = WorkflowHistoryState & WorkflowHistoryAction

export const createWorkflowHistoryStoreShape = temporal<WorkflowHistoryStoreShape>((set, get) => ({
  nodes: [],
  edges: [],
  envs: [],
  getState: () => ({
    nodes: get().nodes,
    edges: get().edges,
    envs: get().envs,
  }),
  setState: (state: WorkflowHistoryState) => set(state),
}), { equality: isDeepEqual })
