import dagre from '@dagrejs/dagre'
import type { Draft } from 'immer'
import { produce } from 'immer'
import { useCallback } from 'react'
import type { WorkflowEdge, WorkflowNode } from '../../../types'
import { useAppReactflowFlowStoreApi, useAppReactflowInstance } from '../../../hooks/reactflow-re-exports'

// 使用dagre进行布局的工具函数，输入节点和边，输出节点位置的映射
export const dagreLayout = <GNode extends WorkflowNode, GEdge extends WorkflowEdge>(
  nodes: GNode[],
  edges: GEdge[],
  configs: { nodesep?: number; ranksep?: number, defaultNodeWidth?: number, defaultNodeHeight?: number } = {},
) => {
  const { nodesep = 80, ranksep = 120, defaultNodeWidth = 30, defaultNodeHeight = 16 } = configs
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: 'LR',
    align: 'UL',
    nodesep,
    ranksep,
    marginx: 0,
    marginy: 0,
    ranker: 'network-simplex',
    acyclicer: 'greedy',
  })

  const nodeIdSet = new Set(nodes.map(node => node.id))

  // 注册节点
  for (const node of nodes) {
    graph.setNode(node.id, {
      width: node.width ?? defaultNodeWidth,
      height: node.height ?? defaultNodeHeight,
    })
  }

 // 注册边（仅注册连接了有效节点的边，且不注册自环边）
  for (const edge of edges) {
    if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue
    if (edge.source === edge.target) continue

    graph.setEdge(edge.source, edge.target)
  }

  dagre.layout(graph)

  // 提取布局结果
  const positionMap = new Map<string, { x: number; y: number }>()
  for (const nodeId of nodeIdSet) {
    const n = graph.node(nodeId)
    if (!n) continue

    positionMap.set(nodeId, { x: n.x, y: n.y })
  }
  return positionMap
}

export const layerNodes = <
  GNode extends WorkflowNode,
  GEdge extends WorkflowEdge,

>(nodes: GNode[], edges: GEdge[], configs: { defaultNodeWidth?: number, defaultNodeHeight?: number } = {}) => {
  const { defaultNodeWidth = 30, defaultNodeHeight = 16 } = configs
  const isMovableNode = (node: GNode | Draft<GNode>) => !node.parentId
  const movableNodes = nodes.filter(isMovableNode)
  if (movableNodes.length === 0) return nodes

  const dagrePositionMap = dagreLayout(
    movableNodes,
    edges,
    { defaultNodeHeight, defaultNodeWidth },
  )

  // 统一平移：确保左边界在 x=0，且纵向中心在 y=0
  let minLeft = Infinity
  let minTop = Infinity
  let maxBottom = -Infinity

  for (const node of movableNodes) {
    const center = dagrePositionMap.get(node.id)
    if (!center) continue
    const width = node.width ?? defaultNodeWidth
    const height = node.height ?? defaultNodeHeight

    const left = center.x - width / 2
    const top = center.y - height / 2
    const bottom = top + height

    if (left < minLeft) minLeft = left
    if (top < minTop) minTop = top
    if (bottom > maxBottom) maxBottom = bottom
  }

  const centerY = (minTop + maxBottom) / 2

  // --- 应用位置 ---
  return produce(nodes, (draftNodes) => {
    for (const node of draftNodes) {
      if (!isMovableNode(node)) continue

      const nextCenter = dagrePositionMap.get(node.id)
      const width = node.width ?? defaultNodeWidth
      const height = node.height ?? defaultNodeHeight
      if (!nextCenter) continue

      node.position = {
        x: nextCenter.x - width / 2 - minLeft,
        y: nextCenter.y - height / 2 - centerY,
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
