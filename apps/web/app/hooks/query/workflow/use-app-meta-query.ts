import { jsonQ } from '@/utils/net'
import type { WorkflowApp } from '@shared/common/workflow/entity'
import { ZodCheckGetAppResp } from '@shared/data-transfer/workflow/info'
import type { GetAppResp } from '@shared/data-transfer/workflow/info'
import { useQuery } from '@tanstack/react-query'
import { defineZodQueryFn } from '../_base'

/**
 * 获取AppMeta meta即不含data的数据 一个app可以有多个version data
 * @param appId AppId
 */
export const useAppMetaQuery = (appId: string) => {
  return useQuery({
    queryKey: ['app-meta', appId],
    queryFn: defineZodQueryFn(ZodCheckGetAppResp,
      async () => await jsonQ.Get<GetAppResp>(`/workflow/record/${appId}`),
      { errMsgFallback: '获取AppMeta失败' },
    ),
  })
}
