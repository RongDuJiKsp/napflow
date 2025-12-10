import { jsonQ } from '@/utils/net'
import type { AccountInfoRespType } from '@shared/data-transfer/account/account'
import { useQuery } from '@tanstack/react-query'

export const useAccountInfoQuery = (accEmail: string) => {
  return useQuery({
    queryKey: ['account-info', accEmail],
    queryFn: async (): Promise<AccountInfoRespType['data']> => {
      const res = await jsonQ.Get<AccountInfoRespType>('/account/account-info', { params: { email: accEmail } })
      return res.data
    },
  })
}
