import { useAccountInfoQuery } from '@/app/hooks/query/account/use-account-info-query'
import type { ComponentWithClass } from '@/utils/type'
import { RiAdminLine, RiUserLine } from '@remixicon/react'
import {
  UserRole,
  type UserRole as UserRoleType,
} from '@shared/common/account/core'
import type { DefaultOptionType } from 'antd/es/select'
import { useMemo } from 'react'
import type { AccountInfo } from '@shared/common/account/base'

type UpDownGradeOptions = {
  icon: ComponentWithClass;
  value: UserRoleType;
  disabled?: boolean;
  tooltip?: string;
} & DefaultOptionType

const UpDownGradeOptionsValueBase: UpDownGradeOptions[] = [
  { value: UserRole.Admin, label: '管理员', icon: RiAdminLine },
  {
    value: UserRole.User,
    label: '普通用户',
    icon: RiUserLine,
    disabled: true,
    tooltip: '普通身份不能被升降级',
  },
]

export const useUpgradeOptions = (targetUser: string) => {
  const { data } = useAccountInfoQuery(targetUser)
  const filterdOptions = useMemo(() => {
    if (!data) return UpDownGradeOptionsValueBase

    return UpDownGradeOptionsValueBase.map((item) => {
      if (item.disabled) return item
      const has = data.userGroup.some(
        (group: AccountInfo['userGroup'][number]) =>
          group.groupType === item.value,
      )
      return {
        ...item,
        disabled: has,
        tooltip: has ? '当前用户已经是该身份' : undefined,
      }
    })
  }, [data])
  return { filterdOptions }
}

export const useDownGradeOptions = (targetUser: string) => {
  const { data } = useAccountInfoQuery(targetUser)
  const filterdOptions = useMemo(() => {
    if (!data) return UpDownGradeOptionsValueBase

    return UpDownGradeOptionsValueBase.map((item) => {
      if (item.disabled) return item
      const notHave = !data.userGroup.some(
        (group: AccountInfo['userGroup'][number]) =>
          group.groupType === item.value,
      )
      return {
        ...item,
        disabled: notHave,
        tooltip: notHave ? '当前用户不是该身份' : undefined,
      }
    })
  }, [data])
  return { filterdOptions }
}
