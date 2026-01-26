import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { AccountInfoResp } from '@shared/data-transfer/account/account'
import type { AccountInfo } from '@shared/common/account/base'
import { useQuery } from '@tanstack/react-query'

/**
 * 获取账号信息
 * @param accEmail 账号邮箱
 */
export const useAccountInfoQuery = (accEmail: string) => {
  return useQuery({
    queryKey: ['account-info', accEmail],
    queryFn: async (): Promise<AccountInfo> => {
      const res = await jsonQ.Get<AccountInfoResp>('/account/account-info', {
        params: { email: accEmail },
      })
      if (res.statusCode !== Code.Ok || !res.data) throw new Error(res.message)
      return res.data
    },
  })
}
