import { memo } from 'react'
import { Item, Menu } from 'react-contexify'
import { NOTE_NODE_PANEL_ID } from '../constants'
import type { ItemParams } from 'react-contexify'
import { useReactFlow } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../types'
import { useWorkflowDraft } from '../hooks/use-workflow-draft'
import { RiDeleteBin2Line, RiEditLine } from '@remixicon/react'

type NoteHandlerProps = ItemParams<{ id: string; onToggleEdit: () => void }>

const NoteContextMenu = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleToggleEdit = ({ props }: NoteHandlerProps) => {
    props?.onToggleEdit?.()
  }

  const handleDelete = ({ props }: NoteHandlerProps) => {
    if (!props?.id) return
    const nodeId = props.id
    reactflow.setEdges(edges =>
      edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    )
    reactflow.setNodes(nodes => nodes.filter(n => n.id !== nodeId))
    submitSyncDraft()
  }

  return (
    <Menu id={NOTE_NODE_PANEL_ID}>
      <Item onClick={handleToggleEdit}>
        <div className="flex gap-2 items-center">
          <RiEditLine className="h-5 w-5" />
          <div>切换编辑/展示模式</div>
        </div>
      </Item>
      <Item onClick={handleDelete} className="contexify-item-danger">
        <div className="flex gap-2 items-center">
          <RiDeleteBin2Line className="h-5 w-5" />
          <div>删除节点</div>
        </div>
      </Item>
    </Menu>
  )
}

export default memo(NoteContextMenu)
