import { jsonQ } from '@/utils/net'
import type { AccountInfoResp } from '@shared/data-transfer/account/account'
import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from './_base'
import type { AccountInfo } from '@shared/common/account/base'

/**
 * 获取账号信息
 * @param accEmail 账号邮箱
 */
export const useAccountInfoQuery = (accEmail: string) => {
  return useQuery({
    queryKey: ['account-info', accEmail],
    queryFn: defineQueryFn<AccountInfoResp, AccountInfo | null>(async () => await jsonQ.Get<AccountInfoResp>('/account/account-info', {
      params: { email: accEmail },
    })),
  })
}
