import type { Connection, NodeChange } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import type { WorkflowEdge, WorkflowNode } from '../types'
import { NodeClassic } from '@shared/common/workflow/core'
import { useComponentNodeOperations } from '../component-nodes/hooks/use-component-node-operations'
import type { ComponentNode } from '../component-nodes/types'
import { useWorkflowDraft } from './use-workflow-draft'
import { useEditorStore } from './use-editor-store'
import { useCommNodeOperation } from './use-comm-node-operation'
import { hiddenNodeTypes } from '@shared/common/workflow/core/component-node'
import { safeAssertIsComponentNode } from '../utils/node-asserts'

export const checkAfterConnMakeCycle = <
  GNode extends WorkflowNode,
  GEdge extends WorkflowEdge,
>(
  nodes: GNode[],
  edges: GEdge[],
  newConn: { sourceId: string; targetId: string },
): boolean => {
  // 构建邻接表（包含现有边 + 新连接）
  const adjMap = new Map<string, string[]>()
  for (const node of nodes) adjMap.set(node.id, [])

  for (const edge of edges) adjMap.get(edge.source)?.push(edge.target)

  adjMap.get(newConn.sourceId)?.push(newConn.targetId)

  // DFS 检测环：0=未访问, 1=访问中, 2=已完成
  const state = new Map<string, number>()
  for (const node of nodes) state.set(node.id, 0)

  const hasCycle = (nodeId: string): boolean => {
    if (state.get(nodeId) === 1) return true // 正在访问中，说明存在环
    if (state.get(nodeId) === 2) return false // 已完成，无需重复访问

    state.set(nodeId, 1)
    for (const neighbor of adjMap.get(nodeId) ?? [])
      if (hasCycle(neighbor)) return true

    state.set(nodeId, 2)
    return false
  }

  // 对所有节点执行 DFS
  for (const node of nodes)
    if (state.get(node.id) === 0 && hasCycle(node.id)) return true

  return false
}

export const useWorkflowViewOperations = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const editorStore = useEditorStore()
  const { submitSyncDraft } = useWorkflowDraft()
  const {
    handleConnect: handleComponentNodeConnect,
    handleDeleteNode: handleComponentNodeDelete,
  } = useComponentNodeOperations()
  const { deleteNode: deleteCommNode } = useCommNodeOperation()

  const handleConnect = useCallback(
    ({ source, target, sourceHandle, targetHandle }: Connection) => {
      const sourceNode = reactflow.getNode(source)
      const targetNode = reactflow.getNode(target)
      if (
        !sourceNode
        || !targetNode
        || reactflow
          .getEdges()
          .find(
            e =>
              e.source === source
              && e.target === target
              && e.sourceHandle === sourceHandle
              && e.targetHandle === targetHandle,
          )
      )
        return
      if (
        checkAfterConnMakeCycle(reactflow.getNodes(), reactflow.getEdges(), {
          sourceId: source,
          targetId: target,
        })
      )
        return

      if (
        sourceNode.type === NodeClassic.Component
        && targetNode.type === NodeClassic.Component
      ) {
        handleComponentNodeConnect(
          sourceNode as ComponentNode,
          targetNode as ComponentNode,
          sourceHandle,
          targetHandle,
        )
      }
      submitSyncDraft()
    },
    [reactflow, handleComponentNodeConnect, submitSyncDraft],
  )

  const handleSingleNodeSelect = useCallback(
    (node: WorkflowNode) => {
      const { selectNode } = editorStore.getState()
      selectNode(node.id)
    },
    [editorStore],
  )

  const handleNodesDeselect = useCallback(
    (nodes: WorkflowNode[]) => {
      const { selectedNodeId, deselectNode } = editorStore.getState()
      // 如果选中的节点在取消选中的节点中，则取消选中
      if (nodes.find(n => n.id === selectedNodeId)) deselectNode()
    },
    [editorStore],
  )
  const handleNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      // 处理单选
      // 这里不能写成changes.filter(c => c.type === 'select' && c.selected) 因为这样无法收窄类型到NodeSelectionChange ts会犯病
      const selections = changes
        .filter(c => c.type === 'select')
        .filter(c => c.selected)
      if (selections.length === 1)
        handleSingleNodeSelect(reactflow.getNode(selections[0].id)!)
      // 处理取消选择
      const deselections = changes
        .filter(c => c.type === 'select')
        .filter(c => !c.selected)
        .map(c => reactflow.getNode(c.id)!)
      handleNodesDeselect(deselections)
    },
    [reactflow, handleSingleNodeSelect, handleNodesDeselect],
  )

  const handleDeleteSelectedElements = useCallback(() => {
    const selectedNodes = reactflow
      .getNodes()
      .filter(n => n.selected)
      .filter((x) => {
        const compNode = safeAssertIsComponentNode(x)
        return !compNode || !hiddenNodeTypes.has(compNode.data.type)
      })
    const selectedEdges = reactflow.getEdges().filter(e => e.selected)
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return

    if (selectedEdges.length > 0) {
      const selectedEdgeIds = new Set(selectedEdges.map(e => e.id))
      reactflow.setEdges(edges =>
        edges.filter(edge => !selectedEdgeIds.has(edge.id)),
      )
    }

    for (const node of selectedNodes) {
      if (node.type === NodeClassic.Component) {
        handleComponentNodeDelete(node as ComponentNode)
        continue
      }
      deleteCommNode(node)
    }

    submitSyncDraft()
  }, [reactflow, handleComponentNodeDelete, deleteCommNode, submitSyncDraft])

  return {
    handleConnect,
    handleNodesChange,
    handleDeleteSelectedElements,
  }
}
