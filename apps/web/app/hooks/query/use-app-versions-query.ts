import { jsonQ } from '@/utils/net'
import type { WorkflowAppDraft } from '@shared/common/workflow/base'
import type { GetVersionsResp } from '@shared/data-transfer/workflow/info'
import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from './_base'

export const useAppVersionsQuery = (appId: string) => {
  return useQuery({
    queryKey: ['app-versions', appId],
    queryFn: defineQueryFn<GetVersionsResp, WorkflowAppDraft[]>(async () => await jsonQ.Get<GetVersionsResp>(`/workflow/${appId}/versions`), { errMsgFallback: '获取版本列表失败' }),
  })
}
