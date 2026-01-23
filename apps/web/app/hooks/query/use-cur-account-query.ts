import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { AccountInfoResp } from '@shared/data-transfer/account/account'
import type { AccountInfo } from '@shared/common/account/base'
import { useQuery } from '@tanstack/react-query'

export const useCurAccountQuery = () => {
  return useQuery({
    queryKey: ['cur-account'],
    queryFn: async (): Promise<AccountInfo> => {
      const res = await jsonQ.Get<AccountInfoResp>('/account/cur-account')
      if (res.statusCode !== Code.Ok || !res.data) throw new Error(res.message)

      return res.data
    },
  })
}
