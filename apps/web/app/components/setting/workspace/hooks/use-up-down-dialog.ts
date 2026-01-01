import type { UserRoleTypeType } from '@shared/data-transfer/account/base'
import { useResetState } from 'ahooks'

export const useUpDownGradeDialog = (targetUser: string, onClose: () => void, action: (target: string, groups: UserRoleTypeType[]) => void | Promise<void>) => {
  const [selectedGroups, setSelectedGroups, resetSelectedGroups] = useResetState<UserRoleTypeType[]>([])

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
