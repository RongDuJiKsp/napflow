import type { MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useContextMenu } from 'react-contexify'
import { NOTE_NODE_PANEL_ID } from '../../constants'
import { useStoreImmerCurd } from '../../hooks/use-reactflow-ext'
import { useWorkflowDraft } from '../../hooks/use-workflow-draft'
import type { WorkflowNode } from '../../types'
import type { NoteData } from '../type'

export const useNoteNode = (id: string) => {
  const [editing, setEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()

  const toggleEdit = useCallback(() => {
    setEditing(prev => !prev)
  }, [])

  // 切换到编辑模式时自动 focus
  useEffect(() => {
    if (editing) {
      // 使用 requestAnimationFrame 确保 DOM 已更新
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
        // 光标移到末尾
        const len = textareaRef.current?.value.length ?? 0
        textareaRef.current?.setSelectionRange(len, len)
      })
    }
  }, [editing])

  const { show } = useContextMenu({ id: NOTE_NODE_PANEL_ID })
  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      show({ event: e, props: { id, onToggleEdit: toggleEdit } })
    },
    [show, id, toggleEdit],
  )

  const handleContentChange = useCallback(
    (content: string) => {
      editNode<WorkflowNode<NoteData>>(id, (draft) => {
        draft.data.content = content
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  const handleBlur = useCallback(() => {
    setEditing(false)
  }, [])
  return {
    editing,
    textareaRef,
    handleContextMenu,
    handleContentChange,
    handleBlur,
    toggleEdit,
  }
}
