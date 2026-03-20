import { useCallback, useMemo } from 'react'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type { ArrayIndexReadData } from '@shared/common/workflow/node-data/array-index-read'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'
import {
  getArrayElementVarType,
  getCommVarCtxName,
  useComponentNodeEnv,
} from '../../../hooks/use-component-node-env'
import type { VarCtx } from '../../../hooks/use-component-node-env'
import type { Var } from '@shared/common/workflow/core/component-node'
import { VarTypes } from '@shared/common/workflow/core/component-node'

const buildNodeVars = (sourceVarName: string, vars: VarCtx[]): Var[] => {
  const sourceVar = vars.find(v => getCommVarCtxName(v) === sourceVarName)
  if (!sourceVar) return []
  if (
    sourceVar.type !== VarTypes.StringArray
    && sourceVar.type !== VarTypes.NumberArray
  )
    return []

  return [{ name: 'value', type: getArrayElementVarType(sourceVar.type) }]
}

export const useArrayIndexReadCurd = (id: string) => {
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()
  const { vars } = useComponentNodeEnv(id)

  const arrayVars = useMemo(
    () =>
      vars.filter(
        (v: VarCtx) =>
          v.type === VarTypes.StringArray || v.type === VarTypes.NumberArray,
      ),
    [vars],
  )

  const handleSourceVarNameChange = useCallback(
    (sourceVarName: string) => {
      editNode<ComponentNode<ArrayIndexReadData>>(id, (draft) => {
        draft.data.sourceVarName = sourceVarName
        draft.data.vars = buildNodeVars(sourceVarName, vars)
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft, vars],
  )

  const handleIndexChange = useCallback(
    (index: string) => {
      editNode<ComponentNode<ArrayIndexReadData>>(id, (draft) => {
        draft.data.index = index
      })
      submitSyncDraft()
    },
    [editNode, id, submitSyncDraft],
  )

  return {
    vars,
    arrayVars,
    handleSourceVarNameChange,
    handleIndexChange,
  }
}
