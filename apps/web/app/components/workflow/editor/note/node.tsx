import { memo } from 'react'
import type { NoteData } from './type'
import type { WorkflowFc } from '../types'
import { twMerge } from 'tailwind-merge'
import { NodeResizer } from '@xyflow/react'
import { useNoteNode } from './hooks/use-note-node'
import { useInputElementEventValueFn } from '@/app/hooks/utils/use-callbacker'
import { stopPropagation } from '@/utils/dom'

const NoteNode: WorkflowFc<NoteData> = ({ id, data, selected, dragging }) => {
  const {
    editing,
    handleContextMenu,
    toggleEdit,
    textareaRef,
    handleBlur,
    handleContentChange,
  } = useNoteNode(id)

  const handleInputChange = useInputElementEventValueFn(handleContentChange)

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
      {editing && (
        <textarea
          ref={textareaRef}
          className={twMerge(
            'w-full h-full bg-transparent outline-none resize-none',
            'text-sm text-gray-700 leading-relaxed',
            'placeholder:text-amber-300',
          )}
          value={data.content}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="输入备注内容..."
          onMouseDown={stopPropagation}
        />
      )}
      {!editing && (
        <div className="w-full h-full text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word overflow-auto">
          {data.content}
        </div>
      )}
    </div>
  )
}

export default memo(NoteNode)
