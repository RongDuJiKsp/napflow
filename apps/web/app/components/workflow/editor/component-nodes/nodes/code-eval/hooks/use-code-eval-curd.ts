import { useCallback } from 'react'
import { useStoreImmerCurd } from '@workflow/editor/hooks/use-reactflow-ext'
import type { ComponentNode } from '@workflow/editor/component-nodes/types'
import type { CodeEvalData } from '@shared/common/workflow/node-data/code-eval'
import { useWorkflowDraft } from '@workflow/editor/hooks/use-workflow-draft'
import { useComponentNodeEnv } from '@workflow/editor/component-nodes/hooks/use-component-node-env'
import { VarTypes } from '@shared/common/workflow/core/component-node'

export const useCodeEvalCurd = (id: string) => {
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()
  const { vars } = useComponentNodeEnv(id)

  const handleCodeChange = useCallback(
    (code: string) => {
      editNode<ComponentNode<CodeEvalData>>(id, (draft) => {
        draft.data.code = code
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  const handleArgAdd = useCallback(() => {
    editNode<ComponentNode<CodeEvalData>>(id, (draft) => {
      draft.data.args = [
        ...(draft.data.args || []),
        {
          kvTarget: '',
          transJsValueType: VarTypes.String,
        },
      ]
    })
    submitSyncDraft()
  }, [editNode, id, submitSyncDraft])

  const handleArgRemove = useCallback(
    (index: number) => {
      editNode<ComponentNode<CodeEvalData>>(id, (draft) => {
        draft.data.args = (draft.data.args || []).filter((_, i) => i !== index)
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  const handleArgKvTargetChange = useCallback(
    (index: number, kvTarget: string) => {
      editNode<ComponentNode<CodeEvalData>>(id, (draft) => {
        const args = draft.data.args || []
        if (args[index]) args[index].kvTarget = kvTarget
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  const handleArgTypeChange = useCallback(
    (index: number, type: VarTypes) => {
      editNode<ComponentNode<CodeEvalData>>(id, (draft) => {
        const args = draft.data.args || []
        if (args[index]) args[index].transJsValueType = type
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  return {
    vars,
    handleCodeChange,
    handleArgAdd,
    handleArgRemove,
    handleArgKvTargetChange,
    handleArgTypeChange,
  }
}
