import type { OnNodesChange } from '@xyflow/react'
import { ReactFlow } from '@xyflow/react'
import type { PropsWithChildren } from 'react'
import { memo, useCallback, useEffect } from 'react'
import { useContextMenu } from 'react-contexify'
import { EDITOR_PANEL_ID, nodeTypes } from './constants'
import EditorPanelContextMenu from './mainview/editor-panel-context-menu'
import type { WorkflowEdge, WorkflowNode } from './types'
import { useEditorStore } from './hooks/use-editor-store'
import { useStore } from 'zustand'
import { StickyNode } from './mainview/sticky-node'
import { useWorkflowViewOperations } from './hooks/use-workflow-view-operations'
import NodeContextMenu from './component-nodes/mainview/node-context-menu'
import NoteContextMenu from './note/context-menu'
import {
  useStoreEdgesState,
  useStoreNodesState,
} from './hooks/use-reactflow-ext'
import NodeEditSiderbar from './component-nodes/mainview/node-edit-siderbar'
import WorkflowEnv from './mainview/workflow-env'
import WorkflowAgent from './mainview/workflow-agent'
import { useKeyPress } from 'ahooks'
import EditorViewOperators from './mainview/editor-view-operators'
const EditorLayout = ({ children }: PropsWithChildren) => {
  return (
    <div id="editor-wrapper" className="h-full">
      <EditorPanelContextMenu />
      <NodeContextMenu />
      <NoteContextMenu />
      <StickyNode />
      <NodeEditSiderbar />
      <WorkflowEnv />
      <WorkflowAgent />
      <EditorViewOperators />
      {children}
    </div>
  )
}

const EditorMainView = ({
  remoteNodes,
  remoteEdges,
}: {
  remoteNodes: WorkflowNode[];
  remoteEdges: WorkflowEdge[];
}) => {
  const editorStore = useEditorStore()
  // 本地修改时具有自己状态 远端更新时直接覆盖本地
  const [nodes, setNodes, handleNodesChangeForStore]
    = useStoreNodesState<WorkflowNode>()
  const [edges, setEdges, handleEdgesChange]
    = useStoreEdgesState<WorkflowEdge>()

  useEffect(() => {
    setNodes(remoteNodes)
    setEdges(remoteEdges)
  }, [remoteNodes, remoteEdges, setNodes, setEdges])

  // NodeContextMenu
  const { show } = useContextMenu({
    id: EDITOR_PANEL_ID,
  })
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      show({ event: e })
    },
    [show],
  )
  // sticky node
  const handleMouseMove = useStore(editorStore, state => state.handleMove)
  // operator
  const {
    handleConnect,
    handleNodesChange: handleNodesChangeForOperator,
    handleDeleteSelectedElements,
  } = useWorkflowViewOperations()

  // merge muti changes
  const handleNodesChange = useCallback<OnNodesChange<WorkflowNode>>(
    (changes) => {
      handleNodesChangeForStore(changes)
      handleNodesChangeForOperator(changes)
    },
    [handleNodesChangeForStore, handleNodesChangeForOperator],
  )
  // keysdown
  useKeyPress('Delete', handleDeleteSelectedElements)
  return (
    <EditorLayout>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onConnect={handleConnect}
      />
    </EditorLayout>
  )
}
export default memo(EditorMainView)
