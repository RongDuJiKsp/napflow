import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type { AccountInfoListQuery, AccountInfoListResp } from '@shared/data-transfer/account/account'
import type { AccountInfo, UserRole } from '@shared/common/account/base'
import { useQuery } from '@tanstack/react-query'

/**
 * 获取账户列表
 * @param isDisabled 过滤选项：是否展示已禁用的账户 true: 只展示已禁用的账户 false: 只展示未禁用的账户 undefined: 展示所有账户
 * @param roles 角色列表 过滤选项：只展示包含指定角色的账户
 */
export const useAccountsQuery = (isDisabled?: boolean, roles?: UserRole[]) => {
  const queryParams: Omit<AccountInfoListQuery, 'roles'> & { roles?: string } = {
    isDisabled,
    roles: roles?.join(','),
  }
  return useQuery({
    queryKey: ['accounts', queryParams],
    queryFn: async (): Promise<AccountInfo[]> => {
      const res = await jsonQ.Get<AccountInfoListResp>('/account/account', {
        params: queryParams,
      })
      if (res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message || '获取账户列表失败')

      return res.data
    },
  })
}
