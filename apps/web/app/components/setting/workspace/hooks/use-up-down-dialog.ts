import type { UserRoleType } from '@shared/common/account/base'
import { useResetState } from 'ahooks'

export const useUpDownGradeDialog = (targetUser: string, onClose: () => void, action: (target: string, groups: UserRoleType[]) => void | Promise<void>) => {
  const [selectedGroups, setSelectedGroups, resetSelectedGroups] = useResetState<UserRoleType[]>([])

  const handleConfirm = async () => {
    if (selectedGroups.length > 0) {
      await action(targetUser, selectedGroups)
      resetSelectedGroups()
      onClose()
    }
  }
  return {
    selectedGroups,
    setSelectedGroups,
    handleConfirm,
  }
}
