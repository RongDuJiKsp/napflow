import { useCallback } from 'react'
import { useStoreImmerCurd } from '@workflow/editor/hooks/use-reactflow-ext'
import type { ComponentNode } from '@workflow/editor/component-nodes/types'
import type { LoopData } from '@shared/common/workflow/node-data/loop'
import { useWorkflowDraft } from '@workflow/editor/hooks/use-workflow-draft'

export const useLoopCurd = (id: string) => {
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleMaxCountChange = useCallback(
    (maxCount: number) => {
      editNode<ComponentNode<LoopData>>(id, (draft) => {
        draft.data.maxCount = maxCount
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  return {
    handleMaxCountChange,
  }
}
