import type { GetLastVersionResp } from '@shared/data-transfer/workflow/info'
import { defineQueryFn } from '../_base'
import type { WorkflowAppData } from '@shared/common/workflow/entity'
import { jsonQ } from '@/utils/net'
import { useQuery } from '@tanstack/react-query'

export const useAppLastVersionQuery = (appId: string) => {
  return useQuery({
    queryKey: ['app-last-version', appId],
    queryFn: defineQueryFn<GetLastVersionResp, WorkflowAppData>(
      async () =>
        await jsonQ.Get<GetLastVersionResp>(`/workflow/versions/${appId}/last`),
    ),
  })
}
