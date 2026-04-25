import { useAppParam } from '@/app/components/workflow/hooks/use-app-param'
import { jsonQ } from '@/utils/net'
import type { RecoverableAgentSessionItem } from '@shared/data-transfer/agent/session'
import { ZodCheckGetRecoverableAgentSessionListResp } from '@shared/data-transfer/agent/session'
import type { GetRecoverableAgentSessionListResp } from '@shared/data-transfer/agent/session'
import { useQuery } from '@tanstack/react-query'
import { defineZodQueryFn } from '../_base'

export const useRecoverSessionListQuery = () => {
  const { appId } = useAppParam()

  return useQuery({
    queryKey: ['recover-session-list', appId],
    queryFn: defineZodQueryFn(ZodCheckGetRecoverableAgentSessionListResp,
      async () =>
        await jsonQ.Get<GetRecoverableAgentSessionListResp>(
          `/agent/session/recover/${encodeURIComponent(appId)}/list`,
        ),
      { errMsgFallback: '获取可恢复会话列表失败' },
    ),
  })
}
