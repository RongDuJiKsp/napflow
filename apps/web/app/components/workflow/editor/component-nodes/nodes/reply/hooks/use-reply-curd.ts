import { useCallback } from 'react'
import { useComponentNodeEnv } from '../../../hooks/use-component-node-env'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type {
  ReplyData,
  ReplyTarget,
} from '@shared/common/workflow/node-data/reply'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'

export const useReplyCurd = (id: string) => {
  const { vars } = useComponentNodeEnv(id)
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleContentChange = useCallback(
    (content: string) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.content = content
      })
      submitSyncDraft()
    },
    [id, editNode, submitSyncDraft],
  )

  const handleReplyTargetChange = useCallback(
    (replyTarget: ReplyTarget) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.replyTarget = replyTarget
        draft.data.userId = undefined
        draft.data.groupId = undefined
        draft.data.triggerSourceId = undefined
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  const handleUserIdChange = useCallback(
    (userId: string) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.userId = userId
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  const handleGroupIdChange = useCallback(
    (groupId: string) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.groupId = groupId
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  const handleTriggerSourceIdChange = useCallback(
    (triggerSourceId: string) => {
      editNode<ComponentNode<ReplyData>>(id, (draft) => {
        draft.data.triggerSourceId = triggerSourceId
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
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
