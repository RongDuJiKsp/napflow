import { jsonQ } from '@/utils/net'
import { defineZodQueryFn } from '../_base'
import { ZodCheckGetVersionMetaResp } from '@shared/data-transfer/workflow/info'
import type { GetVersionMetaResp } from '@shared/data-transfer/workflow/info'
import type { WorkflowAppVersionMeta } from '@shared/common/workflow/base'
import { useQuery } from '@tanstack/react-query'

export const useAppVersionMetaQuery = (appId: string, version: string) => {
  return useQuery({
    queryKey: ['app-version-meta', appId, version],
    queryFn: defineZodQueryFn(ZodCheckGetVersionMetaResp,
      async () =>
        await jsonQ.Get<GetVersionMetaResp>(
          `/workflow/versions/${appId}/${version}/meta`,
        ),
      { errMsgFallback: '获取版本元数据失败' },
    ),
  })
}
