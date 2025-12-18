import type { DataKV } from '@/utils/type'
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from '@xyflow/react'

export type NodeClassic
  = 'component' // 组件节点,该节点作为工作流运行路径的组成部分
  | 'note' // 注释节点,该节点置于组件节点之下但不跟随拖动，用于说明一部分节点 or 一块区域

// 私有数据,要求_开头
export type WorkflowNodeDataPrivate = {
  _cacheKV: DataKV
}

export type WorkflowEdgeDataPrivate = {
  _cacheKV: DataKV
}
// 重新导出Reactflow的类型
export type WorkflowNodeData<T = DataKV> = {
  selected: boolean
} & T & WorkflowNodeDataPrivate
export type WorkflowNode<T = DataKV> = ReactFlowNode<WorkflowNodeData<T>, NodeClassic>

export type WorkflowEdgeData<T = DataKV> = {

} & T & WorkflowEdgeDataPrivate
export type WorkflowEdge<T = DataKV> = ReactFlowEdge<WorkflowEdgeData<T>>

// 工作流State (用于存储，非_开头的属性会发送到远端)
export type WorkflowState = {
  dataId: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}
