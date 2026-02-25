import type { MouseEvent } from 'react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { NoteData } from './type'
import type { WorkflowFc, WorkflowNode } from '../types'
import { twMerge } from 'tailwind-merge'
import { NodeResizer } from '@xyflow/react'
import { useContextMenu } from 'react-contexify'
import { NOTE_NODE_PANEL_ID } from '../constants'
import { useStoreImmerCurd } from '../hooks/use-reactflow-ext'
import { useWorkflowDraft } from '../hooks/use-workflow-draft'

const NoteNode: WorkflowFc<NoteData> = ({ id, data, selected, dragging }) => {
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

  return (
    <div
      className={twMerge(
        'w-full h-full min-w-[120px] min-h-12 px-4 py-3',
        'bg-amber-50/80 rounded-lg border border-amber-200',
        'shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-amber-300',
        selected && 'border-2 border-amber-500 shadow-md',
        dragging && 'opacity-60 cursor-grabbing',
        editing && 'border-amber-400 ring-2 ring-amber-200/50',
      )}
      onContextMenu={handleContextMenu}
      onDoubleClick={!editing ? toggleEdit : undefined}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={48}
        lineClassName="!border-amber-400"
        handleClassName="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-white !rounded-sm"
      />
      {editing && (<textarea
        ref={textareaRef}
        className={twMerge(
          'w-full h-full bg-transparent outline-none resize-none',
          'text-sm text-gray-700 leading-relaxed',
          'placeholder:text-amber-300',
        )}
        value={data.content}
        onChange={e => handleContentChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="输入备注内容..."
              // 阻止拖拽事件冒泡，避免编辑时拖动节点
        onMouseDown={e => e.stopPropagation()}
      />)
      }
      {!editing && (<div className="w-full h-full text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word overflow-auto">
        {data.content}
      </div>)
      }
    </div>
  )
}

export default memo(NoteNode)
