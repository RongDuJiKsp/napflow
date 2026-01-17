import { useCallback } from 'react'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type { TriggerData, TriggerOn } from '../creator'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'

export const useTriggerCurd = (node: ComponentNode<TriggerData>) => {
  const { editNode } = useStoreImmerCurd<ComponentNode<TriggerData>>()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleTriggerTargetChange = useCallback((on: TriggerOn) => {
    editNode(node.id, (draft) => {
      draft.data.on = on
      draft.data.groupId = undefined
      draft.data.userId = undefined
    })
    submitSyncDraft()
  }, [editNode, node.id, submitSyncDraft])

  const handleUserIdChange = useCallback((userId: string) => {
    editNode(node.id, (draft) => {
      draft.data.userId = userId
    })
    submitSyncDraft()
  }, [editNode, node.id, submitSyncDraft])

  const handleGroupIdChange = useCallback((groupId: string) => {
    editNode(node.id, (draft) => {
      draft.data.groupId = groupId
    })
    submitSyncDraft()
  }, [editNode, node.id, submitSyncDraft])

  return{
    handleTriggerTargetChange,
    handleUserIdChange,
    handleGroupIdChange,
  }
}
