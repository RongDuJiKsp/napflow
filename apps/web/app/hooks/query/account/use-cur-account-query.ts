import { jsonQ } from '@/utils/net'
import { ZodCheckAccountInfoResp } from '@shared/data-transfer/account/account'
import type { AccountInfoResp } from '@shared/data-transfer/account/account'
import type { AccountInfo } from '@shared/common/account/base'
import { useQuery } from '@tanstack/react-query'
import { defineZodQueryFn } from '../_base'

/**
 * 获取当前账号信息
 */
export const useCurAccountQuery = () => {
  return useQuery({
    queryKey: ['cur-account'],
    queryFn: defineZodQueryFn<AccountInfo | null>(ZodCheckAccountInfoResp,
      async () => await jsonQ.Get<AccountInfoResp>('/account/query/cur'),
    ),
  })
}
