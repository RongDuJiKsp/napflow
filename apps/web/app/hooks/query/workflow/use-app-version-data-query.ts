import { jsonQ } from '@/utils/net'
import { defineZodQueryFn } from '../_base'
import { ZodCheckGetVersionResp } from '@shared/data-transfer/workflow/info'
import type { GetVersionResp } from '@shared/data-transfer/workflow/info'
import type { WorkflowAppData } from '@shared/common/workflow/entity'
import { useQuery } from '@tanstack/react-query'

export const useAppVersionDataQuery = (appId: string, version: string) => {
  return useQuery({
    queryKey: ['app-version-data', appId, version],
    queryFn: defineZodQueryFn(ZodCheckGetVersionResp,
      async () =>
        await jsonQ.Get<GetVersionResp>(
          `/workflow/versions/${appId}/${version}/query`,
        ),
    ),
  })
}
