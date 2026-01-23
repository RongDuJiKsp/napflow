import { useStoreApi } from '@xyflow/react'
import { useCallback, useMemo } from 'react'
import type { WorkflowEdge, WorkflowNode } from '../types'
import type { WorkflowAppDraft } from '@shared/common/workflow/base'
import { ZodCheckWorkflowAppDraft } from '@shared/common/workflow/base'
import { jsonQ } from '@/utils/net'
import { useAppParam } from '../../hooks/use-app-param'
import type { NullResp } from '@shared/data-transfer/_base'
import { useSubmitZodFn } from '@/app/hooks/utils/use-form'
import { debounce } from 'lodash-es'

export const useWorkflowDraft = () => {
  const { appId } = useAppParam()
  const workflowStore = useStoreApi<WorkflowNode, WorkflowEdge>()
  const getCurrentStateSnapshot = useCallback((): WorkflowAppDraft => {
    const { nodes, edges } = workflowStore.getState()
    return { nodes, edges, ofAppId: appId }
  }, [workflowStore, appId])
  const syncRequest = useCallback(
    async (draft: WorkflowAppDraft) =>
      await jsonQ.Post<NullResp>(`/workflow/${appId}/sync`, draft),
    [appId],
  )
  const submitFn = useSubmitZodFn(ZodCheckWorkflowAppDraft, syncRequest, {
    successText: '',
  })
  const doSyncDraft = useCallback(async () => {
    const draft = getCurrentStateSnapshot()
    await submitFn(draft)
  }, [getCurrentStateSnapshot, submitFn])
  const submitSyncDraft = useMemo(
    () => debounce(doSyncDraft, 5000),
    [doSyncDraft],
  )

  return {
    getCurrentStateSnapshot,
    doSyncDraft,
    submitSyncDraft,
  }
}
