import { jsonQ } from '@/utils/net'
import type { WorkflowAppDraft } from '@shared/common/workflow/base'
import type { LoadDraftResp } from '@shared/data-transfer/workflow/info'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from './_base'

/**
 * 获取工作流应用草稿
 */
export const useWorkflowAppDraftQuery = (
  appId: string,
  options?: Omit<UseQueryOptions<WorkflowAppDraft>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    ...options,
    queryKey: ['workflow-app-data-draft', appId],
    queryFn: defineQueryFn<LoadDraftResp, WorkflowAppDraft>(
      async () => await jsonQ.Get<LoadDraftResp>(`/workflow/${appId}/draft`),
    ),
  })
}
