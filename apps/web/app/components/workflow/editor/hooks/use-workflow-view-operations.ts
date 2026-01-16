import type { Connection, NodeChange } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import type { WorkflowEdge, WorkflowNode } from '../types'
import { NodeClassic } from '@shared/common/workflow/core'
import { useComponentNodeOperations } from '../component-nodes/hooks/use-component-node-operations'
import type { ComponentNode } from '../component-nodes/types'
import { useWorkflowDraft } from './use-workflow-draft'
import { useEditorStore } from './use-editor-store'

export const useWorkflowViewOperations = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const editorStore = useEditorStore()
  const { submitSyncDraft } = useWorkflowDraft()
  const { handleConnenct: handleComponentNodeConnect } = useComponentNodeOperations()

  const handleConnect = useCallback(({ source, target }: Connection) => {
    const sourceNode = reactflow.getNode(source)
    const targetNode = reactflow.getNode(target)
    if (!sourceNode || !targetNode || reactflow.getEdges().find(e => e.source === source && e.target === target)) return
    if(sourceNode.type === NodeClassic.Component && targetNode.type === NodeClassic.Component)
      handleComponentNodeConnect(sourceNode as ComponentNode, targetNode as ComponentNode)
    submitSyncDraft()
  }, [reactflow, handleComponentNodeConnect, submitSyncDraft])

  const handleSingleNodeSelect = useCallback((node: WorkflowNode) => {
    const { selectNode } = editorStore.getState()
    selectNode(node.id)
    console.log('sel')
  }, [editorStore])

  const handleNodesDeselect = useCallback((nodes: WorkflowNode[]) => {
    const { selectedNodeId, deselectNode } = editorStore.getState()
    // 如果选中的节点在取消选中的节点中，则取消选中
    if(nodes.find(n => n.id === selectedNodeId))
      deselectNode()
  }, [editorStore])
  const handleNodesChange = useCallback((changes: NodeChange<WorkflowNode>[]) => {
    // 处理单选
    // 这里不能写成changes.filter(c => c.type === 'select' && c.selected) 因为这样无法收窄类型到NodeSelectionChange ts会犯病
    const selections = changes.filter(c => c.type === 'select').filter(c => c.selected)
    if(selections.length === 1)
      handleSingleNodeSelect(reactflow.getNode(selections[0].id)!)
    // 处理取消选择
    const deselections = changes.filter(c => c.type === 'select').filter(c => !c.selected).map(c => reactflow.getNode(c.id)!)
    handleNodesDeselect(deselections)
  }, [reactflow, handleSingleNodeSelect, handleNodesDeselect])

  return {
    handleConnect,
    handleNodesChange,
  }
}
