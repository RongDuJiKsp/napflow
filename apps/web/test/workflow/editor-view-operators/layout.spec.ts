import {
  dagreLayout,
  layerNodes,
} from '@/app/components/workflow/editor/mainview/editor-view-operators/hooks/use-editor-view-operators'
import { NodeClassic } from '@shared/common/workflow/core'
import type { GraphEdge, WorkflowEdge, WorkflowNode } from '../../utils'
import { describe, expect, test } from 'vitest'

const node = ({
  id,
  x = 0,
  y = 0,
  width,
  height,
  parentId,
}: {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  parentId?: string;
}) => {
  return {
    id,
    type: NodeClassic.Component,
    data: {
      _cacheKV: {},
      expanded: false,
    },
    position: { x, y },
    ...(width === undefined ? {} : { width }),
    ...(height === undefined ? {} : { height }),
    ...(parentId === undefined ? {} : { parentId }),
  }
}

const edge = (source: string, target: string): GraphEdge => ({
  source,
  target,
})

describe('dagreLayout', () => {
  test('线性 DAG 应按从左到右布局', () => {
    const nodes = [node({ id: 'A' }), node({ id: 'B' }), node({ id: 'C' })]
    const edges = [edge('A', 'B'), edge('B', 'C')]

    const positions = dagreLayout(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
    )

    const centerA = positions.get('A')
    const centerB = positions.get('B')
    const centerC = positions.get('C')

    expect(positions.size).toBe(3)
    expect(centerA).toBeDefined()
    expect(centerB).toBeDefined()
    expect(centerC).toBeDefined()

    if (!centerA || !centerB || !centerC)
      throw new Error('布局结果缺少节点坐标')

    expect(centerA.x).toBeLessThan(centerB.x)
    expect(centerB.x).toBeLessThan(centerC.x)
  })

  test('应忽略自环边和无效端点边', () => {
    const nodes = [node({ id: 'A' }), node({ id: 'B' })]
    const edges = [edge('A', 'A'), edge('A', 'X'), edge('A', 'B')]

    const positions = dagreLayout(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
    )

    const centerA = positions.get('A')
    const centerB = positions.get('B')

    expect(positions.size).toBe(2)
    expect(centerA).toBeDefined()
    expect(centerB).toBeDefined()

    if (!centerA || !centerB) throw new Error('布局结果缺少节点坐标')

    expect(centerA.x).toBeLessThan(centerB.x)
  })

  test('未给节点宽高时应使用默认尺寸参数参与布局', () => {
    const nodes = [node({ id: 'A' }), node({ id: 'B' })]
    const edges = [edge('A', 'B')]

    const compact = dagreLayout(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      {
        defaultNodeWidth: 30,
        defaultNodeHeight: 16,
      },
    )
    const wide = dagreLayout(nodes as WorkflowNode[], edges as WorkflowEdge[], {
      defaultNodeWidth: 300,
      defaultNodeHeight: 16,
    })

    const compactA = compact.get('A')
    const compactB = compact.get('B')
    const wideA = wide.get('A')
    const wideB = wide.get('B')

    if (!compactA || !compactB || !wideA || !wideB)
      throw new Error('布局结果缺少节点坐标')

    const compactGap = compactB.x - compactA.x
    const wideGap = wideB.x - wideA.x

    expect(wideGap).toBeGreaterThan(compactGap)
  })
})

describe('layerNodes', () => {
  test('应返回新数组且不修改原始节点', () => {
    const nodes = [
      node({ id: 'A', x: 100, y: 200 }),
      node({ id: 'B', x: 500, y: 600 }),
    ]
    const edges = [edge('A', 'B')]

    const layered = layerNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      {
        defaultNodeWidth: 30,
        defaultNodeHeight: 16,
      },
    )

    expect(layered).not.toBe(nodes)
    expect(nodes[0].position).toEqual({ x: 100, y: 200 })
    expect(nodes[1].position).toEqual({ x: 500, y: 600 })
  })

  test('应仅整理无 parentId 的节点，并将可整理节点左边界归零', () => {
    const nodes = [
      node({ id: 'A', x: 300, y: 30 }),
      node({ id: 'B', x: 900, y: 400 }),
      node({ id: 'C', x: 88, y: 99, parentId: 'PARENT' }),
    ]
    const edges = [edge('A', 'B'), edge('B', 'C')]

    const layered = layerNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      {
        defaultNodeWidth: 30,
        defaultNodeHeight: 16,
      },
    )

    const nodeA = layered.find(n => n.id === 'A')
    const nodeB = layered.find(n => n.id === 'B')
    const nodeC = layered.find(n => n.id === 'C')

    if (!nodeA || !nodeB || !nodeC) throw new Error('缺少预期节点')

    const minLeft = Math.min(nodeA.position.x, nodeB.position.x)

    expect(nodeA.position.x).toBeLessThan(nodeB.position.x)
    expect(minLeft).toBeCloseTo(0, 6)
    expect(nodeC.position).toEqual(nodes[2].position)
  })

  test('整理后可整理节点整体纵向中心应在 y=0', () => {
    const nodes = [
      node({ id: 'A', x: 0, y: 0, width: 60, height: 30 }),
      node({ id: 'B', x: 0, y: 200, width: 80, height: 50 }),
    ]
    const edges = [edge('A', 'B')]

    const layered = layerNodes(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[],
      {
        defaultNodeWidth: 30,
        defaultNodeHeight: 16,
      },
    )

    const nodeA = layered.find(n => n.id === 'A')
    const nodeB = layered.find(n => n.id === 'B')

    if (!nodeA || !nodeB) throw new Error('缺少预期节点')

    const topA = nodeA.position.y
    const bottomA = topA + (nodeA.height ?? 16)
    const topB = nodeB.position.y
    const bottomB = topB + (nodeB.height ?? 16)

    const minTop = Math.min(topA, topB)
    const maxBottom = Math.max(bottomA, bottomB)
    const centerY = (minTop + maxBottom) / 2

    expect(centerY).toBeCloseTo(0, 6)
  })
})
