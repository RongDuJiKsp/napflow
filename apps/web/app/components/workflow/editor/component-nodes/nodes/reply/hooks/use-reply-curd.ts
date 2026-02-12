import { useCallback } from 'react'
import { useComponentNodeEnv } from '../../../hooks/use-component-node-env'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type { ReplyData, ReplyTarget } from '@shared/common/workflow/node-data/reply'

export const useReplyCurd = (id: string) => {
  const { vars } = useComponentNodeEnv(id)
  const { editNode } = useStoreImmerCurd()

  const handleContentChange = useCallback(
    (content: string) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.content = content
      })
    },
    [id, editNode],
  )

  const handleReplyTargetChange = useCallback(
    (replyTarget: ReplyTarget) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.replyTarget = replyTarget
        draft.data.userId = undefined
        draft.data.groupId = undefined
        draft.data.triggerSourceId = undefined
      })
    },
    [id, editNode],
  )

  const handleUserIdChange = useCallback(
    (userId: string) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.userId = userId
      })
    },
    [id, editNode],
  )

  const handleGroupIdChange = useCallback(
    (groupId: string) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.groupId = groupId
      })
    },
    [id, editNode],
  )

  const handleTriggerSourceIdChange = useCallback(
    (triggerSourceId: string) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.triggerSourceId = triggerSourceId
      })
    },
    [id, editNode],
  )
  return {
    vars,
    handleContentChange,
    handleReplyTargetChange,
    handleUserIdChange,
    handleGroupIdChange,
    handleTriggerSourceIdChange,
  }
}
