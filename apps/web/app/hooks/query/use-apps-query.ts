import { useQuery } from '@tanstack/react-query'
import type { GetAppsResp } from '@shared/data-transfer/workflow/info'
import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { WorkflowApp } from '@shared/common/workflow/base'

export const useAppsQuery = (onlySelf?: boolean) => {
  return useQuery({
    queryKey: ['apps', onlySelf],
    queryFn: async (): Promise<WorkflowApp[]> => {
      const res = await jsonQ.Get<GetAppsResp>('/workflow/apps')
      if (res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message || '获取插件列表失败')

      return res.data
    },
  })
}
