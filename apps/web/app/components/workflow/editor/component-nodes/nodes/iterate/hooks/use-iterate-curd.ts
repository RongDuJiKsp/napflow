import { useCallback } from 'react'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type { IterateData } from '@shared/common/workflow/node-data/iterate'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'

export const useIterateCurd = (id: string) => {
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleSourceVarNameChange = useCallback(
    (sourceVarName: string) => {
      editNode<ComponentNode<IterateData>>(id, (draft) => {
        draft.data.sourceVarName = sourceVarName
      })

      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  return {
    handleSourceVarNameChange,
  }
}
