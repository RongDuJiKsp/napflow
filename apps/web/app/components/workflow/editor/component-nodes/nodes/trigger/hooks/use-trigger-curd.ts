import { useCallback } from 'react'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type { TriggerData, TriggerOn } from '../creator'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'

export const useTriggerCurd = (nodeId: string) => {
  const { editNode } = useStoreImmerCurd<ComponentNode<TriggerData>>()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleTriggerTargetChange = useCallback((on: TriggerOn) => {
    editNode(nodeId, (draft) => {
      draft.data.on = on
      draft.data.groupId = undefined
      draft.data.userId = undefined
    })
    submitSyncDraft()
  }, [editNode, nodeId, submitSyncDraft])

  const handleUserIdChange = useCallback((userId: string) => {
    editNode(nodeId, (draft) => {
      draft.data.userId = userId
    })
    submitSyncDraft()
  }, [editNode, nodeId, submitSyncDraft])

  const handleGroupIdChange = useCallback((groupId: string) => {
    editNode(nodeId, (draft) => {
      draft.data.groupId = groupId
    })
    submitSyncDraft()
  }, [editNode, nodeId, submitSyncDraft])

  return{
    handleTriggerTargetChange,
    handleUserIdChange,
    handleGroupIdChange,
  }
}
