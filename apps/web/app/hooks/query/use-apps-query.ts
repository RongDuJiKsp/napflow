import { useQuery } from '@tanstack/react-query'
import type { GetAppsResp } from '@shared/data-transfer/workflow/info'
import { jsonQ } from '@/utils/net'
import type { WorkflowApp } from '@shared/common/workflow/entity'
import { defineQueryFn } from './_base'

/**
 * 获取插件列表
 * @param onlySelf 是否只获取自己的插件
 */
export const useAppsQuery = (onlySelf?: boolean) => {
  return useQuery({
    queryKey: ['apps', onlySelf],
    queryFn: defineQueryFn<GetAppsResp, WorkflowApp[]>(
      async () =>
        await jsonQ.Get<GetAppsResp>('/workflow/apps', {
          params: { onlySelf },
        }),
      { errMsgFallback: '获取插件列表失败' },
    ),
  })
}
