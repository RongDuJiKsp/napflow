import type { Edge, Node } from '@shared/common/workflow/core'
import { ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import type { PropsWithChildren } from 'react'
import { memo, useCallback, useEffect } from 'react'
import NodeEditPanel from './mainview/NodeEditPanel'
import { useContextMenu } from 'react-contexify'
import { EDITOR_PANEL_ID } from './constants'
import EditorPanelContext from './mainview/EditorPanelContext'
const EditorLayout = ({ children }: PropsWithChildren) => {
  return (
    <div id='editor-wrapper' className='h-full'>
      <NodeEditPanel/>
      <EditorPanelContext />
      {children}
    </div>
  )
}

const EditorMainView = ({ remoteNodes, remoteEdges}: { remoteNodes: Node[], remoteEdges: Edge[] }) => {
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
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onContextMenu={handleContextMenu}
      />
    </EditorLayout>
  )
}
export default memo(EditorMainView)
