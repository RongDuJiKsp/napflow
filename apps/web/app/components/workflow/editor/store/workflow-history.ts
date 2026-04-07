import type { Var } from '@shared/common/workflow/core/component-node'
import type { WorkflowEdge, WorkflowNode } from '../types'
import { temporal } from 'zundo'
import isDeepEqual from 'fast-deep-equal'

export enum WorkflowHistoryActionTag {
  Override = 'override', // 标记为覆盖类型的历史记录会被保存，即使它与上一个历史记录的内容相同。
  UnInitial = 'uninitial', // uninitial 标记为未初始化的历史记录，
  Initial = 'initial', // initial 为初始状态下的Snapshot，标记为Initial的历史记录表示这是初始状态的历史记录，通常在历史记录的最底部。这个状态是不可回退的。
  Snapshot = 'snapshot', //  Snapshot 即保存的目的为打快照，如果它与上一个历史记录的内容相同，则不会被保存。
  Programmatic = 'programmatic', // 标记为 Programmatic 的历史记录表示这是为了主动记录状态的操作
}

export type WorkflowEditorHistoryState = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  envs: Var[];
}
type WorkflowHistoryState = {
  title?: string;
  actionTag: WorkflowHistoryActionTag;
} & WorkflowEditorHistoryState
const selectEditorHistoryState = (
  state: WorkflowHistoryStoreShape,
): WorkflowEditorHistoryState => ({
  nodes: state.nodes,
  edges: state.edges,
  envs: state.envs,
})

type WorkflowHistoryAction = {
  getHistoryState: () => WorkflowHistoryState;
  setHistoryState: (state: WorkflowHistoryState) => void;
}

export type WorkflowHistoryStoreShape = WorkflowHistoryState
  & WorkflowHistoryAction

export const createWorkflowHistoryStoreShape
  = temporal<WorkflowHistoryStoreShape>(
    (set, get) => ({
      nodes: [],
      edges: [],
      envs: [],
      actionTag: WorkflowHistoryActionTag.UnInitial,
      getHistoryState: () => get(),
      setHistoryState: (state: WorkflowHistoryState) => set(state),
    }),
    {
      // 由于无法区分每次load之前的state是用户的还是 zundo 的，所以使用深比较来判断是否真的有变化
      equality: (past, curr) => {
        if (curr.actionTag === WorkflowHistoryActionTag.Override) {
          // 如果是override的状态 说明是覆盖action，则不进行比较，直接保存历史记录
          return false
        }
        if(past.actionTag === WorkflowHistoryActionTag.Initial) {
          // 如果是初始状态，说明之前没有历史记录了，就算当前状态和上一个状态相同也要保存历史记录，防止用户回退到啥也没有的情况
          return false
        }

        return isDeepEqual(
          selectEditorHistoryState(past),
          selectEditorHistoryState(curr),
        )
      },
    },
  )
