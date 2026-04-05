import { useCallback } from 'react'
import { useStoreImmerCurd } from '@workflow/editor/hooks/use-reactflow-ext'
import { useWorkflowDraft } from '@workflow/editor/hooks/use-workflow-draft'
import type { ComponentNode } from '@workflow/editor/component-nodes/types'

export const useEditSiderbarMetaEdit = (nodeId: string) => {
  const { editNode } = useStoreImmerCurd<ComponentNode>()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleChangeTitle = useCallback(
    (title: string) => {
      editNode(nodeId, (draft) => {
        draft.data.title = title
      })
      submitSyncDraft()
    },
    [nodeId, editNode, submitSyncDraft],
  )

  const handleChangeDescription = useCallback(
    (description: string) => {
      editNode(nodeId, (draft) => {
        draft.data.desc = description
      })
      submitSyncDraft()
    },
    [nodeId, editNode, submitSyncDraft],
  )

  return {
    handleChangeTitle,
    handleChangeDescription,
  }
}
