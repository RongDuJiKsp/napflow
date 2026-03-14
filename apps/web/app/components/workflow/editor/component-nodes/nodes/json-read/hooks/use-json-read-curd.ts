import { useCallback, useMemo } from 'react'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type {
  JsonReadData,
  JsonReadOutputBinding,
} from '@shared/common/workflow/node-data/json-read'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'
import {
  type VarCtx,
  useComponentNodeEnv,
} from '../../../hooks/use-component-node-env'
import { type Var, VarTypes } from '@shared/common/workflow/component-node'

const buildNodeVars = (outputs: JsonReadOutputBinding[]): Var[] => {
  return outputs
    .filter(item => item.name.trim())
    .map(item => ({
      name: item.name.trim(),
      type: item.type || VarTypes.String,
    }))
}

export const useJsonReadCurd = (id: string) => {
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()
  const { vars } = useComponentNodeEnv(id)

  const stringVars = useMemo(
    () => vars.filter((v: VarCtx) => v.type === VarTypes.String),
    [vars],
  )

  const editData = useCallback(
    (updater: (draft: ComponentNode<JsonReadData>) => void) => {
      editNode<ComponentNode<JsonReadData>>(id, (draft) => {
        updater(draft)
        draft.data.vars = buildNodeVars(draft.data.outputs)
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  const handleSourceVarNameChange = useCallback(
    (sourceVarName: string) => {
      editData((draft) => {
        draft.data.sourceVarName = sourceVarName
      })
    },
    [editData],
  )

  const handleOutputAdd = useCallback(() => {
    editData((draft) => {
      draft.data.outputs = [
        ...draft.data.outputs,
        {
          name: '',
          field: '',
          type: VarTypes.String,
        },
      ]
    })
  }, [editData])

  const handleOutputRemove = useCallback(
    (index: number) => {
      editData((draft) => {
        draft.data.outputs = draft.data.outputs.filter((_, i) => i !== index)
      })
    },
    [editData],
  )

  const handleOutputNameChange = useCallback(
    (index: number, name: string) => {
      editData((draft) => {
        const outputs = draft.data.outputs
        if (outputs[index]) outputs[index].name = name
      })
    },
    [editData],
  )

  const handleOutputFieldChange = useCallback(
    (index: number, field: string) => {
      editData((draft) => {
        const outputs = draft.data.outputs
        if (outputs[index]) outputs[index].field = field
      })
    },
    [editData],
  )

  const handleOutputTypeChange = useCallback(
    (index: number, type: VarTypes) => {
      editData((draft) => {
        const outputs = draft.data.outputs
        if (outputs[index]) outputs[index].type = type
      })
    },
    [editData],
  )

  return {
    stringVars,
    handleSourceVarNameChange,
    handleOutputAdd,
    handleOutputRemove,
    handleOutputNameChange,
    handleOutputFieldChange,
    handleOutputTypeChange,
  }
}
