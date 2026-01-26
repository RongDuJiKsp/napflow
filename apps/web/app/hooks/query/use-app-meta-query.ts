import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { WorkflowApp } from '@shared/common/workflow/base'
import type { GetAppResp } from '@shared/data-transfer/workflow/info'
import { useQuery } from '@tanstack/react-query'

/**
 * 获取AppMeta meta即不含data的数据 一个app可以有多个version data
 * @param appId AppId
 */
export const useAppMetaQuery = (appId: string) => {
  return useQuery({
    queryKey: ['app-meta', appId],
    queryFn: async (): Promise<WorkflowApp> => {
      const res = await jsonQ.Get<GetAppResp>(`/workflow/${appId}`)
      if (res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message || '获取AppMeta失败')

      return res.data
    },
  })
}
