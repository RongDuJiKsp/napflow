import type { OpenAiEndpointConfigRecord } from '@shared/common/agent/entity'
import { useQuery } from '@tanstack/react-query'

export const useApiKeyListQuery = () => {
  return useQuery<OpenAiEndpointConfigRecord[]>({
    queryKey: ['api-key-list'],
  })
}
