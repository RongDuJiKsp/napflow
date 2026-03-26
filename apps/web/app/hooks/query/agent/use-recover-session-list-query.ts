import { useAppParam } from '@/app/components/workflow/hooks/use-app-param'
import { jsonQ } from '@/utils/net'
import type { RecoverableAgentSessionItem } from '@shared/data-transfer/agent/session'
import type { GetRecoverableAgentSessionListResp } from '@shared/data-transfer/agent/session'
import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from '../_base'

export const useRecoverSessionListQuery = () => {
  const { appId } = useAppParam()

  return useQuery({
    queryKey: ['recover-session-list', appId],
    queryFn: defineQueryFn<
      GetRecoverableAgentSessionListResp,
      RecoverableAgentSessionItem[]
    >(
      async () =>
        await jsonQ.Get<GetRecoverableAgentSessionListResp>(
          `/agent/session/recover/${encodeURIComponent(appId)}/list`,
        ),
      { errMsgFallback: '获取可恢复会话列表失败', dataNullAsError: false },
    ),
  })
}
