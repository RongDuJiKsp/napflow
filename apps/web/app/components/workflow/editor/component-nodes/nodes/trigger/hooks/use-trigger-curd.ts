import { useCallback } from 'react'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type { TriggerData, TriggerOn } from '../creator'

export const useTriggerCurd = (node: ComponentNode<TriggerData>) => {
  const { editNode } = useStoreImmerCurd<ComponentNode<TriggerData>>()

  const handleTriggerTargetChange = useCallback((on: TriggerOn) => {
    editNode(node.id, (draft) => {
      draft.data.on = on
    })
  }, [editNode, node.id])

  const handleUserIdChange = useCallback((userId: string) => {
    editNode(node.id, (draft) => {
      draft.data.userId = userId
    })
  }, [editNode, node.id])

  const handleGroupIdChange = useCallback((groupId: string) => {
    editNode(node.id, (draft) => {
      draft.data.groupId = groupId
    })
  }, [editNode, node.id])

  return{
    handleTriggerTargetChange,
    handleUserIdChange,
    handleGroupIdChange,
  }
}
