import { UserRole } from '@shared/data-transfer/account/base'
import { useCurAccountQuery } from '../query/use-cur-account-query'

export const useAccountMeta = () => {
  const { data: accountInfo } = useCurAccountQuery()
  const isAdmin = accountInfo?.userGroup.map(a => a.groupType).includes(UserRole.Admin)

  return {
    accountInfo,
    isAdmin,
  }
}
