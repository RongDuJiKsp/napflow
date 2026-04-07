import type { NodeClassic } from '@shared/common/workflow/core'
import type {
  NodeProps,
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from '@xyflow/react'
import type { ComponentType, FC } from 'react'
import type {
  WorkflowEdgeData,
  WorkflowNodeData,
} from '@shared/common/workflow/core/workflow-node-data'

// 重新导出Reactflow的类型
export type WorkflowNode<T = unknown> = ReactFlowNode<
  WorkflowNodeData<T>,
  NodeClassic
>
export type WorkflowEdge<T = unknown> = ReactFlowEdge<WorkflowEdgeData<T>>

// workflow 节点component
export type WorkflowProps<T = unknown> = NodeProps<WorkflowNode<T>>
export type WorkflowReactComponent<T = unknown> = ComponentType<
  WorkflowProps<T>
>
export type WorkflowFc<T = unknown> = FC<WorkflowProps<T>>
export type WorkflowSimpleReactComponent = ComponentType<{ nodeId: string }>
export type WorkflowSimpleFc = FC<{ nodeId: string }>
