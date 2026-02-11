import { jsonQ } from '@/utils/net'
import { defineQueryFn } from './_base'
import type { GetVersionResp } from '@shared/data-transfer/workflow/info'
import type { WorkflowAppData } from '@shared/common/workflow/base'
import { useQuery } from '@tanstack/react-query'

export const useAppVersionDataQuery = (appId: string, version: string) => {
  return useQuery({
    queryKey: ['app-version-data', appId, version],
    queryFn: defineQueryFn<GetVersionResp, WorkflowAppData>(async () => await jsonQ.Get<GetVersionResp>(`/app/${appId}/version/${version}`)),
  })
}
