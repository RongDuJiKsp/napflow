import {
  getLinkedLastNode,
  getLinkedNodes,
} from '@/app/components/workflow/editor/component-nodes/nodes/loop/hooks/use-loop-operator'
import type { TestEdge, WorkflowEdge, WorkflowNode } from '../../utils'
import { createPositionNode as node } from '../../utils'
import { describe, expect, test } from 'vitest'

describe('getLinkedNodes', () => {
  test('单个节点、无边，返回仅包含 headNode 的数组', () => {
    const nodes = [node('A')]
    const edges: TestEdge[] = []
    const result = getLinkedNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    expect(result).toEqual([nodes[0]])
  })

  test('线性链路 A -> B -> C，从 A 开始返回 [A, B, C]', () => {
    const nodes = [node('A'), node('B'), node('C')]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
    ]
    const result = getLinkedNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    expect(result.map(n => n.id)).toEqual(['A', 'B', 'C'])
  })

  test('从中间节点开始，只返回后续链路', () => {
    const nodes = [node('A'), node('B'), node('C')]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
    ]
    const result = getLinkedNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[1] as WorkflowNode,
    )
    expect(result.map(n => n.id)).toEqual(['B', 'C'])
  })

  test('存在分支时，只沿第一条匹配的边走', () => {
    const nodes = [node('A'), node('B'), node('C')]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' },
    ]
    const result = getLinkedNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    // 由于 edges.find 返回第一条匹配的边，应走 A -> B
    expect(result.map(n => n.id)).toEqual(['A', 'B'])
  })

  test('边的 target 不在 nodes 范围内时停止', () => {
    const nodes = [node('A'), node('B')]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' }, // C 不在 nodes 中
    ]
    const result = getLinkedNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    expect(result.map(n => n.id)).toEqual(['A', 'B'])
  })

  test('长链路正确遍历', () => {
    const ids = ['N1', 'N2', 'N3', 'N4', 'N5']
    const nodes = ids.map(id => node(id))
    const edges: TestEdge[] = ids.slice(0, -1).map((id, i) => ({
      source: id,
      target: ids[i + 1],
    }))
    const result = getLinkedNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    expect(result.map(n => n.id)).toEqual(ids)
  })

  test('存在无关边时不受影响', () => {
    const nodes = [node('A'), node('B')]
    const edges: TestEdge[] = [
      { source: 'X', target: 'Y' }, // 无关边
      { source: 'A', target: 'B' },
      { source: 'Y', target: 'A' }, // 无关边
    ]
    const result = getLinkedNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    expect(result.map(n => n.id)).toEqual(['A', 'B'])
  })

  test('空 nodes 和空 edges 时返回仅 headNode', () => {
    const head = node('A')
    const result = getLinkedNodes(
      [] as WorkflowNode[],
      [] as WorkflowEdge[],
      head as WorkflowNode,
    )
    // headNode 始终包含在结果中，即使不在 nodes 列表内
    expect(result.map(n => n.id)).toEqual(['A'])
  })
})

describe('getLinkedLastNode', () => {
  test('单个节点、无边，返回 headNode 自身', () => {
    const nodes = [node('A')]
    const edges: TestEdge[] = []
    const result = getLinkedLastNode(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    expect(result.id).toBe('A')
  })

  test('线性链路 A -> B -> C，返回末尾节点 C', () => {
    const nodes = [node('A'), node('B'), node('C')]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
    ]
    const result = getLinkedLastNode(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    expect(result.id).toBe('C')
  })

  test('从中间节点开始，返回链路末尾', () => {
    const nodes = [node('A'), node('B'), node('C')]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
    ]
    const result = getLinkedLastNode(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[1] as WorkflowNode,
    )
    expect(result.id).toBe('C')
  })

  test('边的 target 不在 nodes 范围内时返回当前末尾', () => {
    const nodes = [node('A'), node('B')]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
    ]
    const result = getLinkedLastNode(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    expect(result.id).toBe('B')
  })

  test('长链路返回最后一个节点', () => {
    const ids = ['N1', 'N2', 'N3', 'N4', 'N5']
    const nodes = ids.map(id => node(id))
    const edges: TestEdge[] = ids.slice(0, -1).map((id, i) => ({
      source: id,
      target: ids[i + 1],
    }))
    const result = getLinkedLastNode(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      nodes[0] as WorkflowNode,
    )
    expect(result.id).toBe('N5')
  })
})
