import type { Edge, Node } from '@shared/common/workflow/core'
import { ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import type { PropsWithChildren } from 'react'
import { memo, useEffect } from 'react'
import NodeEditPanel from './mainview/node-edit-panel'
const EditorLayout = ({ children }: PropsWithChildren) => {
  return (
    <div id='editor-wrapper' className='h-full'>
      <NodeEditPanel/>
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

  return (
    <EditorLayout>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
      />
    </EditorLayout>
  )
}
export default memo(EditorMainView)
