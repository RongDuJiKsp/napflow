import { ZodCheckGetLastVersionResp } from '@shared/data-transfer/workflow/info'
import { defineZodQueryFn } from '../_base'
import type { GetLastVersionResp } from '@shared/data-transfer/workflow/info'
import { jsonQ } from '@/utils/net'
import { useQuery } from '@tanstack/react-query'

export const useAppLastVersionQuery = (appId: string) => {
  return useQuery({
    queryKey: ['app-last-version', appId],
    queryFn: defineZodQueryFn(
      ZodCheckGetLastVersionResp,
      async () =>
        await jsonQ.Get<GetLastVersionResp>(`/workflow/versions/${appId}/last`),
    ),
  })
}
