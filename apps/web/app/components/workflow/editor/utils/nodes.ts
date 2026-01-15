import type { Edge, Node } from '@shared/common/workflow/core'
import type { WorkflowEdge, WorkflowNode } from '../types'
import { merge } from 'lodash-es'
import type { DataKV } from '@/utils/type'

export const initNodes = (nodes: Node[]): WorkflowNode[] => {
  return nodes
}
export const initEdges = (edges: Edge[]): WorkflowEdge[] => {
  return edges
}
export const genNodeId = () => `${Date.now()}@comm`
export const genEdgeId = () => `${Date.now()}@commedge`

export const createWorkflowNode = <T extends DataKV = DataKV>(inital: Partial<WorkflowNode<T>>): WorkflowNode<T> => {
  return merge(<WorkflowNode>{
    id: genNodeId(),
    data: {
      _cacheKV: {},
    },
    position: { x: 0, y: 0 },
  }, inital)
}
