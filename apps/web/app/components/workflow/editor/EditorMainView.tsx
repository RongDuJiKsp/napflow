import { ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import type { PropsWithChildren } from 'react'
import { memo, useCallback, useEffect } from 'react'
import { useContextMenu } from 'react-contexify'
import { EDITOR_PANEL_ID, nodeTypes } from './constants'
import EditorPanelContext from './mainview/editor-panel-context'
import type { WorkflowEdge, WorkflowNode } from './types'
import { useEditorStore } from './hooks/use-editor-store'
import { useStore } from 'zustand'
import { StickyNode } from './mainview/sticky-node'
import { useWorkflowViewOperations } from './hooks/use-workflow-view-operations'
const EditorLayout = ({ children }: PropsWithChildren) => {
  return (
    <div id='editor-wrapper' className='h-full'>
      <EditorPanelContext />
      <StickyNode />
      {children}
    </div>
  )
}

const EditorMainView = ({ remoteNodes, remoteEdges}: { remoteNodes: WorkflowNode[], remoteEdges: WorkflowEdge[] }) => {
  const editorStore = useEditorStore()
  // 本地修改时具有自己状态 远端更新时直接覆盖本地
  const [nodes, setNodes, handleNodesChange] = useNodesState(remoteNodes)
  const [edges, setEdges, handleEdgesChange] = useEdgesState(remoteEdges)
  useEffect(() => {
    setNodes(remoteNodes)
    setEdges(remoteEdges)
  }, [remoteNodes, remoteEdges, setNodes, setEdges])

  // ContextMenu
  const { show } = useContextMenu({
    id: EDITOR_PANEL_ID,
  })
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    show({ event: e })
  }, [show])
  // sticky node
  const handleMouseMove = useStore(editorStore, state => state.handleMove)
  // operator
  const { handleConnect } = useWorkflowViewOperations()
  return (
    <EditorLayout>
      <ReactFlow
        nodes={nodes} edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange} onEdgesChange={handleEdgesChange}
        onContextMenu={handleContextMenu} onMouseMove={handleMouseMove}
        onConnect={handleConnect}
      />
    </EditorLayout>
  )
}
export default memo(EditorMainView)
