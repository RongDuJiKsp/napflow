import { UserRole } from '@shared/common/account/core'
import { useCurAccountQuery } from '../query/account/use-cur-account-query'

export const useAccountMeta = () => {
  const { data: accountInfo } = useCurAccountQuery()
  const isAdmin = accountInfo?.userGroup
    .map(a => a.groupType)
    .includes(UserRole.Admin)

  return {
    accountInfo,
    isAdmin,
  }
}
