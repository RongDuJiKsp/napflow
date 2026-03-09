import type {
  WorkflowEdge,
  WorkflowNode,
} from '@/app/components/workflow/editor/types'

/**
 * 基础测试节点类型，仅包含 id
 */
export type TestNode = {
  id: string;
}

/**
 * 带环境变量数据的测试节点类型，用于 node-env 相关测试
 */
export type TestNodeWithData<T = any> = {
  id: string;
  parentId?: string;
  data: T;
}

/**
 * 带位置信息的测试节点类型，用于 linked-nodes 相关测试
 */
export type TestNodeWithPosition = {
  id: string;
  position: { x: number; y: number };
}

/**
 * 通用测试边类型
 */
export type TestEdge = {
  source: string;
  target: string;
}

/**
 * 创建带默认位置的测试节点的工厂函数
 */
export const createPositionNode = (id: string): TestNodeWithPosition => ({
  id,
  position: { x: 0, y: 0 },
})

// 重新导出类型，方便测试文件统一导入
export type { WorkflowEdge, WorkflowNode }
