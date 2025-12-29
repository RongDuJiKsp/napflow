import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { WorkflowAppType } from '@shared/data-transfer/workflow/base'
import type { GetAppRespType } from '@shared/data-transfer/workflow/info'
import { useQuery } from '@tanstack/react-query'

export const useAppMetaQuery = (appId: string) => {
  return useQuery({
    queryKey: ['app-meta', appId],
    queryFn: async (): Promise<WorkflowAppType> => {
      const res = await jsonQ.Get<GetAppRespType>(`/workflow/${appId}`)
      if(res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message || '获取AppMeta失败')

      return res.data
    },
  })
}
