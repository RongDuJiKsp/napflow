import type { Edge, Node } from '@shared/common/workflow/core'
import type { WorkflowEdge, WorkflowNode } from '../types'
import { merge } from 'lodash-es'
import type { PartialWithout } from '@/utils/type'

export const initNodes = (nodes: Node[]): WorkflowNode[] => {
  return nodes.map((node) => {
    return merge(node, {
      data: {
        _cacheKV: {},
      },
    })
  })
}
export const initEdges = (edges: Edge[]): WorkflowEdge[] => {
  return edges.map((edge) => {
    return merge(edge, {
      data: {
        _cacheKV: {},
      },
    })
  })
}
export const genNodeId = () => `${Date.now()}@comm`
export const genEdgeId = () => `${Date.now()}@commedge`

export const createWorkflowNode = <T = unknown>(
  inital: PartialWithout<WorkflowNode<T>, 'type'>,
): WorkflowNode<T> => {
  return merge(
    {
      id: genNodeId(),
      data: {
        _cacheKV: {},
        expanded: false,
      },
      position: { x: 0, y: 0 },
    },
    inital,
  )
}
export const createWorkflowEdge = (
  inital: PartialWithout<WorkflowEdge, 'source' | 'target'>,
): WorkflowEdge => {
  return merge(
    {
      id: genEdgeId(),
      data: {
        _cacheKV: {},
      },
    },
    inital,
  )
}
