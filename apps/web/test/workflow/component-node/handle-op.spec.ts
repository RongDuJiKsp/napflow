import { checkAfterConnMakeCycle } from '@components/workflow/editor/hooks/use-workflow-view-operations'
import type {
  WorkflowEdge,
  WorkflowNode,
} from '@/app/components/workflow/editor/types'
import { describe, expect, test } from 'vitest'
describe('测试checkAfterConnMakeCycle能否正确检测添加新连接后是否形成环', () => {
  type TestNode = {
    id: string;
  }
  type TestEdge = {
    source: string;
    target: string;
  }

  test('无环：简单两节点连接', () => {
    const nodes: TestNode[] = [{ id: '1' }, { id: '2' }]
    const edges: TestEdge[] = []
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '1', targetId: '2' },
    )
    expect(result).toBe(false)
  })

  test('有环：自环（自身连接自身）', () => {
    const nodes: TestNode[] = [{ id: '1' }]
    const edges: TestEdge[] = []
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '1', targetId: '1' },
    )
    expect(result).toBe(true)
  })

  test('有环：两节点互相连接形成环', () => {
    const nodes: TestNode[] = [{ id: '1' }, { id: '2' }]
    const edges: TestEdge[] = [{ source: '1', target: '2' }]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '2', targetId: '1' },
    )
    expect(result).toBe(true)
  })

  test('有环：三节点形成环', () => {
    const nodes: TestNode[] = [{ id: '1' }, { id: '2' }, { id: '3' }]
    const edges: TestEdge[] = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '3', targetId: '1' },
    )
    expect(result).toBe(true)
  })

  test('无环：链式结构添加不形成环的连接', () => {
    const nodes: TestNode[] = [{ id: '1' }, { id: '2' }, { id: '3' }]
    const edges: TestEdge[] = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '1', targetId: '3' },
    )
    expect(result).toBe(false)
  })

  test('无环：空节点和空边', () => {
    const nodes: TestNode[] = []
    const edges: TestEdge[] = []
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '1', targetId: '2' },
    )
    expect(result).toBe(false)
  })

  test('无环：多个独立子图不形成环', () => {
    const nodes: TestNode[] = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
    ]
    const edges: TestEdge[] = [
      { source: '1', target: '2' },
      { source: '3', target: '4' },
    ]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '2', targetId: '3' },
    )
    expect(result).toBe(false)
  })

  test('有环：连接两个独立子图形成环', () => {
    const nodes: TestNode[] = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
    ]
    const edges: TestEdge[] = [
      { source: '1', target: '2' },
      { source: '3', target: '4' },
      { source: '4', target: '1' },
    ]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '2', targetId: '3' },
    )
    expect(result).toBe(true)
  })

  test('无环：菱形结构（DAG）', () => {
    const nodes: TestNode[] = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
    ]
    const edges: TestEdge[] = [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
    ]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '3', targetId: '4' },
    )
    expect(result).toBe(false)
  })

  test('有环：菱形结构添加反向边形成环', () => {
    const nodes: TestNode[] = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
    ]
    const edges: TestEdge[] = [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
    ]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '4', targetId: '1' },
    )
    expect(result).toBe(true)
  })

  test('有环：复杂图中的间接环路', () => {
    const nodes: TestNode[] = [
      { id: 'A' },
      { id: 'B' },
      { id: 'C' },
      { id: 'D' },
      { id: 'E' },
    ]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
      { source: 'C', target: 'D' },
      { source: 'D', target: 'E' },
    ]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: 'E', targetId: 'A' },
    )
    expect(result).toBe(true)
  })

  test('无环：复杂DAG添加前向边', () => {
    const nodes: TestNode[] = [
      { id: 'A' },
      { id: 'B' },
      { id: 'C' },
      { id: 'D' },
      { id: 'E' },
    ]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
      { source: 'C', target: 'D' },
      { source: 'D', target: 'E' },
    ]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: 'A', targetId: 'E' },
    )
    expect(result).toBe(false)
  })

  test('有环：多入口形成的环', () => {
    const nodes: TestNode[] = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
    ]
    const edges: TestEdge[] = [
      { source: '1', target: '3' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
      { source: '4', target: '5' },
    ]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '5', targetId: '2' },
    )
    expect(result).toBe(true)
  })

  test('无环：孤立节点之间的连接', () => {
    const nodes: TestNode[] = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
    ]
    const edges: TestEdge[] = [{ source: '1', target: '2' }]
    const result = checkAfterConnMakeCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      { sourceId: '3', targetId: '4' },
    )
    expect(result).toBe(false)
  })
})
