import { useCallback, useMemo } from 'react'
import { useStoreImmerCurd } from '@workflow/editor/hooks/use-reactflow-ext'
import type { ComponentNode } from '@workflow/editor/component-nodes/types'
import type { IterateData } from '@shared/common/workflow/node-data/iterate'
import { useWorkflowDraft } from '@workflow/editor/hooks/use-workflow-draft'
import { VarTypes } from '@shared/common/workflow/core/component-node'
import { useComponentNodeEnv } from '@workflow/editor/component-nodes/hooks/use-component-node-env'

export const useIterateCurd = (id: string) => {
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()
  const { vars } = useComponentNodeEnv(id)
  const arrayVars = useMemo(
    () =>
      vars.filter(
        v =>
          v.type === VarTypes.StringArray || v.type === VarTypes.NumberArray,
      ),
    [vars],
  )

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
    arrayVars,
    handleSourceVarNameChange,
  }
}
