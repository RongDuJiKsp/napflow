import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { AccountInfoRespType } from '@shared/data-transfer/account/account'
import type { AccountInfoType } from '@shared/data-transfer/account/base'
import { useQuery } from '@tanstack/react-query'

export const useCurAccountQuery = () => {
  return useQuery({
    queryKey: ['cur-account'],
    queryFn: async (): Promise<AccountInfoType> => {
      const res = await jsonQ.Get<AccountInfoRespType>('/account/cur-account')
      if (res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message)

      return res.data
    },
  })
}
