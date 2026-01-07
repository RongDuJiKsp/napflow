import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { AccountInfoResp } from '@shared/data-transfer/account/account'
import type { AccountInfo } from '@shared/data-transfer/account/base'
import { useQuery } from '@tanstack/react-query'

export const useAccountInfoQuery = (accEmail: string) => {
  return useQuery({
    queryKey: ['account-info', accEmail],
    queryFn: async (): Promise<AccountInfo> => {
      const res = await jsonQ.Get<AccountInfoResp>('/account/account-info', { params: { email: accEmail } })
      if (res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message)
      return res.data
    },
  })
}
