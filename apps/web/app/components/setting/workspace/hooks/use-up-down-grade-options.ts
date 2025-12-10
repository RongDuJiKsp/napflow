import { useAccountInfoQuery } from '@/app/hooks/query/use-account-info-query'
import type { ComponentWithClass } from '@/utils/type'
import { RiAdminLine, RiUserLine } from '@remixicon/react'
import type { UserRoleTypeType } from '@shared/data-transfer/account/account'
import type { DefaultOptionType } from 'antd/es/select'
import { useMemo } from 'react'

type UpDownGradeOptions = {
  icon: ComponentWithClass;
  value: UserRoleTypeType;
  disabled?: boolean;
  tooltip?: string;
} & DefaultOptionType

const UpDownGradeOptionsValueBase: UpDownGradeOptions[] = [
  { value: 'Admin', label: '管理员', icon: RiAdminLine },
  { value: 'User', label: '普通用户', icon: RiUserLine, disabled: true, tooltip: '普通身份不能被升降级' },
]

export const useUpgradeOptions = (targetUser: string) => {
  const { data } = useAccountInfoQuery(targetUser)
  const filterdOptions = useMemo(() => {
    if(!data)
      return UpDownGradeOptionsValueBase

    return UpDownGradeOptionsValueBase.map(item => item)
  }, [data])
  return { filterdOptions }
}

export const useDownGradeOptions = (targetUser: string) => {
  const { data } = useAccountInfoQuery(targetUser)
  const filterdOptions = useMemo(() => {
    if(!data)
      return UpDownGradeOptionsValueBase

    return UpDownGradeOptionsValueBase.map(item => item)
  }, [data])
  return { filterdOptions }
}
