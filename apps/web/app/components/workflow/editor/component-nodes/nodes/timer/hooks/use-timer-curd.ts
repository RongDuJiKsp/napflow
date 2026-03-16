import { useCallback } from 'react'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type { TimerData } from '@shared/common/workflow/node-data/timer'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'
import { useComponentNodeEnv } from '../../../hooks/use-component-node-env'

export const useTimerCurd = (nodeId: string) => {
  const { vars } = useComponentNodeEnv(nodeId)
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleTimeExprChange = useCallback(
    (timeExpr: string) => {
      editNode<ComponentNode<TimerData>>(nodeId, (draft) => {
        draft.data.timeExpr = timeExpr
      })
      submitSyncDraft()
    },
    [editNode, nodeId, submitSyncDraft],
  )

  return {
    vars,
    handleTimeExprChange,
  }
}
