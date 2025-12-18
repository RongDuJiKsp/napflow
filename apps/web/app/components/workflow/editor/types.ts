import type { DataKV } from '@/utils/type'
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from '@xyflow/react'

export type NodeClassic
  = 'component' // 组件节点,该节点作为工作流运行路径的组成部分
  | 'note' // 注释节点,该节点置于组件节点之下但不跟随拖动，用于说明一部分节点 or 一块区域

// 重新导出Reactflow的类型
export type WorkflowNodeData<T = DataKV> = {

} & T
export type WorkflowNode<T = DataKV> = ReactFlowNode<WorkflowNodeData<T>, NodeClassic>

export type WorkflowEdgeData<T = DataKV> = {

} & T
export type WorkflowEdge<T = DataKV> = ReactFlowEdge<WorkflowEdgeData<T>>

// 工作流State（包含前端私有）
export type WorkflowState = {
  dataId: string
  nodes: WorkflowNode[] | null
  edges?: WorkflowEdge[] | null
}
