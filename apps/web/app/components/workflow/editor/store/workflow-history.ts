import type { Var } from '@shared/common/workflow/core/component-node'
import type { WorkflowEdge, WorkflowNode } from '../types'
import { temporal } from 'zundo'
import isDeepEqual from 'fast-deep-equal'

export enum WorkflowHistoryActionTag {
  Current = 'current', // current指的是从当前状态保存而来的
  Programme = 'programme',
}

type WorkflowEditorHistoryState = {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  envs: Var[];
}
type WorkflowHistoryState = {
  title?: string;
  actionTag: WorkflowHistoryActionTag;
} & WorkflowEditorHistoryState
const selectEditorHistoryState = (state: WorkflowHistoryStoreShape): WorkflowEditorHistoryState => ({
  nodes: state.nodes,
  edges: state.edges,
  envs: state.envs,
})

type WorkflowHistoryAction = {
  getHistoryState: () => WorkflowHistoryState;
  setHistoryState: (state: WorkflowHistoryState) => void;
}

export type WorkflowHistoryStoreShape = WorkflowHistoryState & WorkflowHistoryAction

export const createWorkflowHistoryStoreShape = temporal<WorkflowHistoryStoreShape>((set, get) => ({
  nodes: [],
  edges: [],
  envs: [],
  actionTag: WorkflowHistoryActionTag.Current,
  getHistoryState: () => get(),
  setHistoryState: (state: WorkflowHistoryState) => set(state),
}), {
  // 由于无法区分每次load之前的state是用户的还是 zundo 的，所以使用深比较来判断是否真的有变化
  equality: (past, curr) => {
    if(curr.actionTag === WorkflowHistoryActionTag.Programme) {
     // 如果是programme的状态 说明是覆盖action，则不进行比较，直接保存历史记录
      return false
    }
    // 只有当actionTag是current时才进行比较，确保当上一次programme的状态和当前状态相同时不重复存储历史记录
    return isDeepEqual(selectEditorHistoryState(past), selectEditorHistoryState(curr))
  },
})
