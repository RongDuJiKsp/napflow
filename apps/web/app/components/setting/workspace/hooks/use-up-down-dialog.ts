import type { UserRoleTypeType } from '@shared/data-transfer/account/base'
import { useState } from 'react'

export const useUpDownGradeDialog = (targetUser: string, onClose: () => void, action: (target: string, groups: UserRoleTypeType[]) => void | Promise<void>) => {
  const [selectedGroups, setSelectedGroups] = useState<UserRoleTypeType[]>([])

  const handleConfirm = async () => {
    if (selectedGroups.length > 0) {
      await action(targetUser, selectedGroups)
      onClose()
    }
  }
  return {
    selectedGroups,
    setSelectedGroups,
    handleConfirm,
  }
}
