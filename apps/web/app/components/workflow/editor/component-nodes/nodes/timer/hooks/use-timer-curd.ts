import { useCallback } from 'react'
import { useStoreImmerCurd } from '@workflow/editor/hooks/use-reactflow-ext'
import type { ComponentNode } from '@workflow/editor/component-nodes/types'
import type { TimerTriggerMode } from '@shared/common/workflow/node-data/timer'
import type { TimerData } from '@shared/common/workflow/node-data/timer'
import { useWorkflowDraft } from '@workflow/editor/hooks/use-workflow-draft'
import { useComponentNodeEnv } from '@workflow/editor/component-nodes/hooks/use-component-node-env'

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

  const handleTimerModeChange = useCallback(
    (mode: TimerTriggerMode) => {
      editNode<ComponentNode<TimerData>>(nodeId, (draft) => {
        draft.data.mode = mode
        draft.data.timeExpr = ''
      })
      submitSyncDraft()
    },
    [editNode, nodeId, submitSyncDraft],
  )

  return {
    vars,
    handleTimerModeChange,
    handleTimeExprChange,
  }
}
