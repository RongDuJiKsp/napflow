import { useCallback } from 'react'
import { useComponentNodeEnv } from '@workflow/editor/component-nodes/hooks/use-component-node-env'
import { useStoreImmerCurd } from '@workflow/editor/hooks/use-reactflow-ext'
import type { ComponentNode } from '@workflow/editor/component-nodes/types'
import type {
  TriggerData,
  TriggerOn,
} from '@shared/common/workflow/node-data/trigger'
import { useWorkflowDraft } from '@workflow/editor/hooks/use-workflow-draft'

export const useTriggerCurd = (nodeId: string) => {
  const { vars } = useComponentNodeEnv(nodeId)
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleTriggerTargetChange = useCallback(
    (on: TriggerOn) => {
      editNode<ComponentNode<TriggerData>>(nodeId, (draft) => {
        draft.data.on = on
        draft.data.groupId = undefined
        draft.data.userId = undefined
      })
      submitSyncDraft()
    },
    [editNode, nodeId, submitSyncDraft],
  )

  const handleUserIdChange = useCallback(
    (userId: string) => {
      editNode<ComponentNode<TriggerData>>(nodeId, (draft) => {
        draft.data.userId = userId
      })
      submitSyncDraft()
    },
    [editNode, nodeId, submitSyncDraft],
  )

  const handleGroupIdChange = useCallback(
    (groupId: string) => {
      editNode<ComponentNode<TriggerData>>(nodeId, (draft) => {
        draft.data.groupId = groupId
      })
      submitSyncDraft()
    },
    [editNode, nodeId, submitSyncDraft],
  )

  return {
    vars,
    handleTriggerTargetChange,
    handleUserIdChange,
    handleGroupIdChange,
  }
}
