import { useCallback } from 'react'
import { useComponentNodeEnv } from '../../../hooks/use-component-node-env'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type {
  DifyData,
  DifyMode,
} from '@shared/common/workflow/node-data/dify'
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

  const handleModeChange = useCallback(
    (mode: DifyMode) => {
      editNode<ComponentNode<DifyData>>(id, (draft) => {
        draft.data.mode = mode
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

  const handleInputAdd = useCallback(() => {
    editNode<ComponentNode<DifyData>>(id, (draft) => {
      draft.data.inputs = [
        ...(draft.data.inputs ?? []),
        { key: '', value: '' },
      ]
    })
    submitSyncDraft()
  }, [id, editNode, submitSyncDraft])

  const handleInputRemove = useCallback(
    (index: number) => {
      editNode<ComponentNode<DifyData>>(id, (draft) => {
        draft.data.inputs = (draft.data.inputs ?? []).filter(
          (_, i) => i !== index,
        )
      })
      submitSyncDraft()
    },
    [id, editNode, submitSyncDraft],
  )

  const handleInputKeyChange = useCallback(
    (index: number, key: string) => {
      editNode<ComponentNode<DifyData>>(id, (draft) => {
        const inputs = draft.data.inputs ?? []
        if (inputs[index]) inputs[index].key = key
      })
      submitSyncDraft()
    },
    [id, editNode, submitSyncDraft],
  )

  const handleInputValueChange = useCallback(
    (index: number, value: string) => {
      editNode<ComponentNode<DifyData>>(id, (draft) => {
        const inputs = draft.data.inputs ?? []
        if (inputs[index]) inputs[index].value = value
      })
      submitSyncDraft()
    },
    [id, editNode, submitSyncDraft],
  )

  return {
    vars,
    handleBaseUrlChange,
    handleApiKeyChange,
    handleModeChange,
    handleQueryChange,
    handleInputAdd,
    handleInputRemove,
    handleInputKeyChange,
    handleInputValueChange,
  }
}
