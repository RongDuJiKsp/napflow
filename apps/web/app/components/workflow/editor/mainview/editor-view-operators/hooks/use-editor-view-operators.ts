import dagre from '@dagrejs/dagre'
import { produce } from 'immer'
import { useCallback } from 'react'
import type { WorkflowEdge, WorkflowNode } from '../../../types'
import { useAppReactflowFlowStoreApi, useAppReactflowInstance } from '../../../hooks/reactflow-re-exports'

const DEFAULT_NODE_WIDTH = 30
const DEFAULT_NODE_HEIGHT = 15
const DAGRE_NODE_SEP = 80
const DAGRE_RANK_SEP = 120

// ✅ 完全交给 dagre 的 layout
const dagreLayout = (
  nodeIds: string[],
  edges: WorkflowEdge[],
  nodeSizeMap: Map<string, { width: number; height: number }>,
) => {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: 'LR',
    align: 'UL',
    nodesep: DAGRE_NODE_SEP,
    ranksep: DAGRE_RANK_SEP,
    marginx: 0,
    marginy: 0,
    ranker: 'network-simplex',
    acyclicer: 'greedy',
  })

  const nodeIdSet = new Set(nodeIds)

  // 注册节点
  for (const nodeId of nodeIds) {
    const size = nodeSizeMap.get(nodeId)
    if (!size) continue

    graph.setNode(nodeId, {
      width: size.width,
      height: size.height,
    })
  }

  // ✅ 使用真实 edges
  for (const edge of edges) {
    if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue
    if (edge.source === edge.target) continue

    graph.setEdge(edge.source, edge.target)
  }

  dagre.layout(graph)

  const positionMap = new Map<string, { x: number; y: number }>()

  for (const nodeId of nodeIds) {
    const n = graph.node(nodeId)
    if (!n) continue

    positionMap.set(nodeId, { x: n.x, y: n.y })
  }

  return positionMap
}

export const layerNodes = <
  GNode extends WorkflowNode,
  GEdge extends WorkflowEdge,
>(nodes: GNode[], edges: GEdge[]) => {
  const movableNodes = nodes.filter(node => !node.parentId)
  if (movableNodes.length === 0) return nodes

  const nodeSizeMap = new Map<string, { width: number; height: number }>()

  for (const node of movableNodes) {
    const size = {
      width: node.width ?? DEFAULT_NODE_WIDTH,
      height: node.height ?? DEFAULT_NODE_HEIGHT,
    }

    nodeSizeMap.set(node.id, size)
  }

  // 按原画布位置排序，给 dagre 提供稳定的无连接子图顺序
  const orderedNodeIds = [...movableNodes]
    .sort((a, b) => {
      if (a.position.y !== b.position.y) return a.position.y - b.position.y
      if (a.position.x !== b.position.x) return a.position.x - b.position.x
      return a.id.localeCompare(b.id)
    })
    .map(node => node.id)

  const dagrePositionMap = dagreLayout(
    orderedNodeIds,
    edges,
    nodeSizeMap,
  )

  // 统一平移：确保布局后的最左上边界落在 (0, 0)
  let minLeft = Infinity
  let minTop = Infinity

  for (const nodeId of orderedNodeIds) {
    const center = dagrePositionMap.get(nodeId)
    const size = nodeSizeMap.get(nodeId)
    if (!center || !size) continue

    const left = center.x - size.width / 2
    const top = center.y - size.height / 2

    if (left < minLeft) minLeft = left
    if (top < minTop) minTop = top
  }

  if (!Number.isFinite(minLeft) || !Number.isFinite(minTop)) return nodes

  // --- 应用位置 ---
  return produce(nodes, (draftNodes) => {
    for (const node of draftNodes) {
      if (node.parentId) continue

      const nextCenter = dagrePositionMap.get(node.id)
      const size = nodeSizeMap.get(node.id)
      if (!nextCenter || !size) continue

      node.position = {
        x: nextCenter.x - size.width / 2 - minLeft,
        y: nextCenter.y - size.height / 2 - minTop,
      }
    }
  })
}

export const useEditorViewOperators = () => {
  const storeApi = useAppReactflowFlowStoreApi()
  const reactflow = useAppReactflowInstance()

  const handleFocusOrigin = useCallback(() => {
    reactflow.setCenter(0, 0, {
      zoom: 1,
      duration: 300,
    })
  }, [reactflow])

  const handleArrangeNodes = useCallback(() => {
    const { nodes, edges, setNodes } = storeApi.getState()
    const layeredNodes = layerNodes(nodes, edges)
    setNodes(layeredNodes)
  }, [storeApi])

  return {
    handleFocusOrigin,
    handleArrangeNodes,
  }
}
