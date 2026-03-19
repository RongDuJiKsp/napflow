import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import type { OpenAiEndpointConfig } from '@shared/common/agent/entity'
import { useResetState } from 'ahooks'
import { useCallback } from 'react'
/**
 * @description 管理 API Key 配置的表单 Hook
 * @param editId - 可选的编辑配置 ID，如果存在则为编辑模式，否则为新增模式
 */
export const useApiKeyConfigForm = (editId?: string) => {
  const [formData, setFormData, resetFormData] = useResetState<OpenAiEndpointConfig>({
    endpoint: '',
    apiKey: '',
    model: '',
  })

  const isEditMode = Boolean(editId)

  const handleEndpointChange = useAreaChangeHandler(setFormData, 'endpoint')
  const handleApiKeyChange = useAreaChangeHandler(setFormData, 'apiKey')
  const handleModelChange = useAreaChangeHandler(setFormData, 'model')

  const handleSubmit = useCallback(() => {

  }, [editId, formData])

  return {
    formData,
    isEditMode,
    handleEndpointChange,
    handleApiKeyChange,
    handleModelChange,
    resetFormData,
    handleSubmit,
  }
}
