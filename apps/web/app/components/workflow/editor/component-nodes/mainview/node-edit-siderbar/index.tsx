import { memo } from 'react'
import { useStore } from 'zustand'
import { useEditorStore } from '../../../hooks/use-editor-store'
import { useNodes } from '@xyflow/react'
import { NodeClassic } from '@shared/common/workflow/core'
import type { ComponentNode, ComponentPanelFc } from '../../types'
import type { WorkflowNode } from '../../../types'
import { Drawer } from 'antd'
import { ComponentNodeCreatorMap } from '../../constants'

const NodeEditSidebarView: ComponentPanelFc<unknown> = ({ node }) => {
  const creator = ComponentNodeCreatorMap[node.data.type]
  return (
    <div>
      <creator.editPanelComponent node={node} />
    </div>
  )
}

const NodeEditSidebar = () => {
  // 如果不是组件节点，就不渲染NodeEditSidebarView组件了
  const editorStore = useEditorStore()
  const nodeId = useStore(editorStore, s => s.selectedNodeId)
  const nodes = useNodes<WorkflowNode>()
  const currNode = nodes.find(n => n.id === nodeId)
  const open = currNode?.type === NodeClassic.Component
  return (
    <Drawer open={open} mask={false} closable={false}>
      {open && <NodeEditSidebarView node={currNode as ComponentNode} />}
    </Drawer>
  )
}

export default memo(NodeEditSidebar)
