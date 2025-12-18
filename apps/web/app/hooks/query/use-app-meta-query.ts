import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { GetAppRespType } from '@shared/data-transfer/workflow/info'
import { useQuery } from '@tanstack/react-query'

export const useAppMetaQuery = (appId: string) => {
  return useQuery({
    queryKey: ['accounts', appId],
    queryFn: async (): Promise<GetAppRespType['data']> => {
      const res = await jsonQ.Get<GetAppRespType>(`/workflow/${appId}`)
      if(res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message || '获取AppMeta失败')

      return res.data
    },
  })
}
