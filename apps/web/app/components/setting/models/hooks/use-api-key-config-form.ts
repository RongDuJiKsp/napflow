import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { useSubmitZodFn } from '@/app/hooks/utils/use-form'
import { useApiKeyListQuery } from '@/app/hooks/query/agent/use-api-key-list-query'
import { jsonQ } from '@/utils/net'
import {
  type OpenAiEndpointConfig,
  ZodCheckOpenAiEndpointConfig,
} from '@shared/common/agent/entity'
import type { NullResp } from '@shared/data-transfer/_base'
import { Code } from '@shared/data-transfer/_base'
import { useResetState } from 'ahooks'
import { useCallback, useEffect } from 'react'
/**
 * @description 管理 API Key 配置的表单 Hook
 * @param editId - 可选的编辑配置 ID，如果存在则为编辑模式，否则为新增模式
 */
export const useApiKeyConfigForm = (editId?: string, onSuccess?: () => void) => {
  const [formData, setFormData, resetFormData] = useResetState<OpenAiEndpointConfig>({
    endpoint: '',
    apiKey: '',
    model: '',
  })
  const { data: configs = [], refetch: refreshConfigList } = useApiKeyListQuery()

  const isEditMode = Boolean(editId)

  useEffect(() => {
    if (!editId) {
      resetFormData()
      return
    }

    const target = configs.find(config => config.id === editId)
    if (!target) return

    setFormData({
      endpoint: target.endpoint,
      apiKey: target.apiKey,
      model: target.model,
    })
  }, [configs, editId, resetFormData, setFormData])

  const handleEndpointChange = useAreaChangeHandler(setFormData, 'endpoint')
  const handleApiKeyChange = useAreaChangeHandler(setFormData, 'apiKey')
  const handleModelChange = useAreaChangeHandler(setFormData, 'model')
  const submitApiKeyConfig = useCallback(
    async (data: OpenAiEndpointConfig) => {
      if (editId) {
        return await jsonQ.Post<NullResp>(
          `/agent/openai-endpoint/${editId}/update`,
          data,
        )
      }

      return await jsonQ.Post<NullResp>('/agent/openai-endpoint/create', data)
    },
    [editId],
  )
  const submitForm = useSubmitZodFn(
    ZodCheckOpenAiEndpointConfig,
    submitApiKeyConfig,
    {
      successText: isEditMode ? '模型配置更新成功' : '模型配置添加成功',
      errorText: isEditMode ? '更新模型配置失败' : '添加模型配置失败',
      afterSuccess: resetFormData,
    },
  )

  const handleSubmit = useCallback(async () => {
    const res = await submitForm(formData)
    if (res?.statusCode !== Code.Ok) return

    await refreshConfigList()
    onSuccess?.()
  }, [formData, onSuccess, refreshConfigList, submitForm])

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
