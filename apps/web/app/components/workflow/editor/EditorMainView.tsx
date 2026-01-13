import { ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import type { PropsWithChildren } from 'react'
import { memo, useCallback, useEffect } from 'react'
import { useContextMenu } from 'react-contexify'
import { EDITOR_PANEL_ID, nodeTypes } from './constants'
import EditorPanelContext from './mainview/EditorPanelContext'
import type { WorkflowEdge, WorkflowNode } from './types'
const EditorLayout = ({ children }: PropsWithChildren) => {
  return (
    <div id='editor-wrapper' className='h-full'>
      <EditorPanelContext />
      {children}
    </div>
  )
}

const EditorMainView = ({ remoteNodes, remoteEdges}: { remoteNodes: WorkflowNode[], remoteEdges: WorkflowEdge[] }) => {
  // 本地修改时具有自己状态 远端更新时直接覆盖本地
  const [nodes, setNodes, onNodesChange] = useNodesState(remoteNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(remoteEdges)
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

  return (
    <EditorLayout>
      <ReactFlow
        nodes={nodes} edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onContextMenu={handleContextMenu}
      />
    </EditorLayout>
  )
}
export default memo(EditorMainView)
