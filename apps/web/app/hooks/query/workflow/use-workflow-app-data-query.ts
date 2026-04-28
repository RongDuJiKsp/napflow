import { jsonQ } from '@/utils/net'
import type { WorkflowAppDraft } from '@shared/common/workflow/base'
import { ZodCheckLoadDraftResp } from '@shared/data-transfer/workflow/info'
import type { LoadDraftResp } from '@shared/data-transfer/workflow/info'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { defineZodQueryFn } from '../_base'

/**
 * 获取工作流应用草稿
 */
export const useWorkflowAppDraftQuery = (
  appId: string,
  options?: Omit<
    UseQueryOptions<WorkflowAppDraft | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    ...options,
    queryKey: ['workflow-app-draft', appId],
    queryFn: defineZodQueryFn(
      ZodCheckLoadDraftResp,
      async () =>
        await jsonQ.Get<LoadDraftResp>(`/workflow/flow/${appId}/draft`),
    ),
  })
}
