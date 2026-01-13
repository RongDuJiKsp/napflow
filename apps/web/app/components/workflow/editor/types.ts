import type { DataKV } from '@/utils/type'
import type { NodeClassic } from '@shared/common/workflow/core'
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from '@xyflow/react'

// 私有数据,要求_开头
export type WorkflowNodeDataPrivate = {
  _cacheKV: DataKV
}

export type WorkflowEdgeDataPrivate = {
  _cacheKV: DataKV
}
// 重新导出Reactflow的类型
export type WorkflowNodeData<T extends DataKV = DataKV> = T & WorkflowNodeDataPrivate
export type WorkflowNode<T extends DataKV = DataKV> = ReactFlowNode<WorkflowNodeData<T>, NodeClassic>

export type WorkflowEdgeData<T extends DataKV = DataKV> = T & WorkflowEdgeDataPrivate
export type WorkflowEdge<T extends DataKV = DataKV> = ReactFlowEdge<WorkflowEdgeData<T>>

// 工作流State (用于存储，非_开头的属性会发送到远端)
export type WorkflowState = {
  dataId: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}
