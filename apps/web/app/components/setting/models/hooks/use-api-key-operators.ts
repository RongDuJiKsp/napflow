import { useCallback, useState } from 'react'
import { App } from 'antd'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import { Code } from '@shared/data-transfer/_base'
import { useApiKeyListQuery } from '@/app/hooks/query/agent/use-api-key-list-query'

export const useApiKeyOperators = () => {
  const { message } = App.useApp()
  const { refetch: refreshConfigList } = useApiKeyListQuery()
  // editTarget: null 没有编辑，string 是编辑对应id，true 是新建
  const [editTarget, setEditTarget] = useState<string | true | undefined>()

  const handleAddConfig = useCallback(() => {
    setEditTarget(true)
  }, [])

  const handleEditConfig = useCallback((id: string) => {
    setEditTarget(id)
  }, [])

  const handleCloseModal = useCallback(() => {
    setEditTarget(undefined)
  }, [])

  const deleteConfig = useCallback(async (id: string) => {
    const res = await jsonQ.Post<NullResp>(`/agent/openai-endpoint/${id}/delete`)
    if (res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }

    message.success('模型配置删除成功')
    await refreshConfigList()
  }, [message, refreshConfigList])

  return {
    editTarget,
    handleAddConfig,
    handleEditConfig,
    handleCloseModal,
    deleteConfig,
  }
}
