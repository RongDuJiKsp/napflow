import { jsonQ } from '@/utils/net'
import type { WorkflowAppDraft } from '@shared/common/workflow/base'
import { Code } from '@shared/data-transfer/_base'
import type { LoadDraftResp } from '@shared/data-transfer/workflow/info'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

export const useWorkflowAppDraftQuery = (appId: string, options?: Omit<UseQueryOptions<WorkflowAppDraft>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    ...options,
    queryKey: ['workflow-app-data', appId],
    queryFn: async (): Promise<WorkflowAppDraft> => {
      const res = await jsonQ.Get<LoadDraftResp>(`/workflow/${appId}/draft`)
      if (res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message)
      return res.data
    },
  })
}
