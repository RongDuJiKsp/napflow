import { jsonQ } from '@/utils/net'
import type { OpenAiEndpointConfigRecord } from '@shared/common/agent/entity'
import type { GetOpenAiEndpointListResp } from '@shared/data-transfer/agent/endpoint'
import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from '../_base'

export const useApiKeyListQuery = () => {
  return useQuery({
    queryKey: ['api-key-list'],
    queryFn: defineQueryFn<GetOpenAiEndpointListResp, OpenAiEndpointConfigRecord[]>(
      async () => await jsonQ.Get<GetOpenAiEndpointListResp>('/agent/openai-endpoint'),
      { errMsgFallback: '获取模型配置列表失败' },
    ),
  })
}
