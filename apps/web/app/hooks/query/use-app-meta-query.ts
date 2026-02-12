import { jsonQ } from '@/utils/net'
import type { WorkflowApp } from '@shared/common/workflow/base'
import type { GetAppResp } from '@shared/data-transfer/workflow/info'
import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from './_base'

/**
 * 获取AppMeta meta即不含data的数据 一个app可以有多个version data
 * @param appId AppId
 */
export const useAppMetaQuery = (appId: string) => {
  return useQuery({
    queryKey: ['app-meta', appId],
    queryFn: defineQueryFn<GetAppResp, WorkflowApp>(
      async () => await jsonQ.Get<GetAppResp>(`/workflow/${appId}`),
      { errMsgFallback: '获取AppMeta失败' },
    ),
  })
}
