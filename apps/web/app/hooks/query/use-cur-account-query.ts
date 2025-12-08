import { jsonQ } from '@/utils/net'
import type { CurAccountInfoRespType } from '@shared/data-transfer/account/account'
import { useQuery } from '@tanstack/react-query'

export const useCurAccountQuery = () => {
  return useQuery({
    queryKey: ['cur-account'],
    queryFn: async (): Promise<CurAccountInfoRespType['data']> => {
      const res = await jsonQ.Get<CurAccountInfoRespType>('/account/cur-account')
      return res.data
    },
  })
}
