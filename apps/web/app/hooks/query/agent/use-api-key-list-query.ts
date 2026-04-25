import { jsonQ } from '@/utils/net'
import { ZodCheckGetOpenAiEndpointListResp } from '@shared/data-transfer/agent/endpoint'
import type { GetOpenAiEndpointListResp } from '@shared/data-transfer/agent/endpoint'
import { useQuery } from '@tanstack/react-query'
import { defineZodQueryFn } from '../_base'

export const useApiKeyListQuery = () => {
  return useQuery({
    queryKey: ['api-key-list'],
    queryFn: defineZodQueryFn(ZodCheckGetOpenAiEndpointListResp,
      async () =>
        await jsonQ.Get<GetOpenAiEndpointListResp>('/agent/openai-endpoint'),
      { errMsgFallback: '获取模型配置列表失败' },
    ),
  })
}
