import { memo, useCallback } from 'react'
import { Item, Menu } from 'react-contexify'
import { NOTE_NODE_PANEL_ID } from '../constants'
import type { ItemParams } from 'react-contexify'
import { useWorkflowDraft } from '../hooks/use-workflow-draft'
import { RiDeleteBin2Line, RiEditLine } from '@remixicon/react'
import { useNoteNodeOperation } from './hooks/use-note-node-operation'

type NoteOperators = {
  onToggleEdit: () => void
}
type NoteHandlerProps = ItemParams<{ id: string } & NoteOperators>

const NoteContextMenu = () => {
  const { submitSyncDraft } = useWorkflowDraft()
  const { deleteNoteNode } = useNoteNodeOperation()

  const handleToggleEdit = useCallback(({ props }: NoteHandlerProps) => {
    props?.onToggleEdit?.()
  }, [])

  const handleDelete = useCallback(({ props }: NoteHandlerProps) => {
    if (!props?.id) return
    const nodeId = props.id
    deleteNoteNode(nodeId)
    submitSyncDraft()
  }, [deleteNoteNode, submitSyncDraft])

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
