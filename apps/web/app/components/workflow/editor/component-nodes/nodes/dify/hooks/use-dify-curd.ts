import { useCallback } from 'react'
import { useComponentNodeEnv } from '../../../hooks/use-component-node-env'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type { DifyData } from '@shared/common/workflow/node-data/dify'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'

export const useDifyCurd = (id: string) => {
  const { vars } = useComponentNodeEnv(id)
  const { editNode } = useStoreImmerCurd()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleBaseUrlChange = useCallback(
    (baseUrl: string) => {
      editNode<ComponentNode<DifyData>>(id, (draft) => {
        draft.data.baseUrl = baseUrl
      })
      submitSyncDraft()
    },
    [id, editNode, submitSyncDraft],
  )

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      editNode<ComponentNode<DifyData>>(id, (draft) => {
        draft.data.apiKey = apiKey
      })
      submitSyncDraft()
    },
    [id, editNode, submitSyncDraft],
  )

  const handleQueryChange = useCallback(
    (query: string) => {
      editNode<ComponentNode<DifyData>>(id, (draft) => {
        draft.data.query = query
      })
      submitSyncDraft()
    },
    [id, editNode, submitSyncDraft],
  )

  return {
    vars,
    handleBaseUrlChange,
    handleApiKeyChange,
    handleQueryChange,
  }
}
