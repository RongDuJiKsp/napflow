import { useApiKeyListQuery } from '@/app/hooks/query/agent/use-api-key-list-query'
import { useArrayDict } from '@/app/hooks/utils/use-callbacker'
import type { OpenAiEndpointConfigRecord } from '@shared/common/agent/entity'
import { useMemo, useState } from 'react'
const getApiKeyListIndex = (config: OpenAiEndpointConfigRecord) => config.id

export const useModelSelection = () => {
  const {
    data: modelConfigs,
    error: apiKeyListError,
    isError: isApiKeyListError,
    isPending: isApiKeyListPending,
  } = useApiKeyListQuery()
  const [selectedConfigId, setSelectedConfigId] = useState<string>()

  const { findItem: findApiKeyItem } = useArrayDict(
    modelConfigs || [],
    getApiKeyListIndex,
  )

  const modelOptions = useMemo(
    () =>
      (modelConfigs || []).map(config => ({
        label: config.model,
        value: config.id,
      })),
    [modelConfigs],
  )

  const selectedModelConfig = useMemo(
    () => modelConfigs?.find(config => config.id === selectedConfigId),
    [modelConfigs, selectedConfigId],
  )

  return {
    modelOptions,
    selectedConfigId,
    selectedModelConfig,
    setSelectedConfigId,
    apiKeyListError,
    isApiKeyListError,
    isApiKeyListPending,
    findApiKeyItem,
  }
}
