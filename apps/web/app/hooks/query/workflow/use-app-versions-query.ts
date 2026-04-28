import { jsonQ } from '@/utils/net'
import { ZodCheckGetVersionsResp } from '@shared/data-transfer/workflow/info'
import type { GetVersionsResp } from '@shared/data-transfer/workflow/info'
import { useQuery } from '@tanstack/react-query'
import { defineZodQueryFn } from '../_base'

export const useAppVersionsQuery = (appId: string) => {
  return useQuery({
    queryKey: ['app-versions', appId],
    queryFn: defineZodQueryFn(
      ZodCheckGetVersionsResp,
      async () =>
        await jsonQ.Get<GetVersionsResp>(`/workflow/versions/${appId}/list`),
      { errMsgFallback: '获取版本列表失败' },
    ),
  })
}
