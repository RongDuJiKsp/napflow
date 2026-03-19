import { jsonQ } from '@/utils/net'
import type {
  AccountInfoListQuery,
  AccountInfoListResp,
} from '@shared/data-transfer/account/account'
import type { AccountInfo } from '@shared/common/account/base'
import type { UserRole } from '@shared/common/account/core'
import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from './_base'

/**
 * 获取账户列表
 * @param isDisabled 过滤选项：是否展示已禁用的账户 true: 只展示已禁用的账户 false: 只展示未禁用的账户 undefined: 展示所有账户
 * @param roles 角色列表 过滤选项：只展示包含指定角色的账户
 */
export const useAccountsQuery = (isDisabled?: boolean, roles?: UserRole[]) => {
  const queryParams: Omit<AccountInfoListQuery, 'roles'> & { roles?: string }
    = {
      isDisabled,
      roles: roles?.join(','),
    }
  return useQuery({
    queryKey: ['accounts', queryParams],
    queryFn: defineQueryFn<AccountInfoListResp, AccountInfo[]>(
      async () =>
        await jsonQ.Get<AccountInfoListResp>('/account/account', {
          params: queryParams,
        }),
      { errMsgFallback: '获取账户列表失败' },
    ),
  })
}
