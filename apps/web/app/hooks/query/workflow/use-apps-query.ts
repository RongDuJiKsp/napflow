import { useQuery } from '@tanstack/react-query'
import { ZodCheckGetAppsResp } from '@shared/data-transfer/workflow/info'
import type { GetAppsResp } from '@shared/data-transfer/workflow/info'
import { jsonQ } from '@/utils/net'
import { defineZodQueryFn } from '../_base'

/**
 * 获取插件列表
 * @param onlySelf 是否只获取自己的插件
 */
export const useAppsQuery = (onlySelf?: boolean) => {
  return useQuery({
    queryKey: ['apps', onlySelf],
    queryFn: defineZodQueryFn(
      ZodCheckGetAppsResp,
      async () =>
        await jsonQ.Get<GetAppsResp>('/workflow/record/list', {
          params: { onlySelf },
        }),
      { errMsgFallback: '获取插件列表失败' },
    ),
  })
}
