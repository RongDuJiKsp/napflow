import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { AccountInfoListResp } from '@shared/data-transfer/account/account'
import type { AccountInfo } from '@shared/common/account/base'
import {
  useQuery,
} from '@tanstack/react-query'
export const useAccountsQuery = (isDisabled?: boolean, roles?: string[]) => {
  const queryParams = {
    isDisabled,
    roles: roles?.join(','),
  }
  return useQuery({
    queryKey: ['accounts', queryParams],
    queryFn: async (): Promise<AccountInfo[]> => {
      const res = await jsonQ.Get<AccountInfoListResp>('/account/account', { params: queryParams })
      if(res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message || '获取账户列表失败')

      return res.data
    },
  })
}
