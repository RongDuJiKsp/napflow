import { useCallback, useState } from 'react'

export const useApiKeyOperators = () => {
    // editTarget: null 没有编辑，string 是编辑对应id，true 是新建
  const [editTarget, setEditTarget] = useState<string | true | undefined>()
  const handleAddConfig = useCallback(() => {
    setEditTarget(true)
  }, [])
  const handleEditConfig = useCallback((id: string) => {
    setEditTarget(id)
  }, [])
  const handleCloseModal = useCallback(() => {
    setEditTarget(null)
  }, [])
  const deleteConfig = useCallback((id: string) => {
    // TODO: 删除逻辑
  }, [])
  return {
    editTarget,
    handleAddConfig,
    handleEditConfig,
    handleCloseModal,
    deleteConfig,
  }
}
