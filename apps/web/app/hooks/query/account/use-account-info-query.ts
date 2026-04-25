import { jsonQ } from '@/utils/net'
import { ZodCheckAccountInfoResp } from '@shared/data-transfer/account/account'
import type { AccountInfoResp } from '@shared/data-transfer/account/account'
import { useQuery } from '@tanstack/react-query'
import { defineZodQueryFn } from '../_base'

/**
 * 获取账号信息
 * @param accEmail 账号邮箱
 */
export const useAccountInfoQuery = (accEmail: string) => {
  return useQuery({
    queryKey: ['account-info', accEmail],
    queryFn: defineZodQueryFn(
      ZodCheckAccountInfoResp,
      async () =>
        await jsonQ.Get<AccountInfoResp>('/account/query/info', {
          params: { email: accEmail },
        }),
    ),
  })
}
