import { jsonQ } from '@/utils/net'
import type { AccountInfoResp } from '@shared/data-transfer/account/account'
import type { AccountInfo } from '@shared/common/account/base'
import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from '../_base'

/**
 * 获取当前账号信息
 */
export const useCurAccountQuery = () => {
  return useQuery({
    queryKey: ['cur-account'],
    queryFn: defineQueryFn<AccountInfoResp, AccountInfo | null>(
      async () => await jsonQ.Get<AccountInfoResp>('/account/query/cur'),
    ),
  })
}
