import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from '../../_base'
import { jsonQ } from '@/utils/net'
import type { BotHealthSamplesResp } from '@shared/data-transfer/bot/health-check'
import type { BotPluginStatusStatics } from '@shared/common/bot/health-check'

/**
 * @description  获取Bot健康检查数据
 * @param botId
 * @returns
 */
export const useBotHealthCheckQuery = (botId: string) => {
  return useQuery({
    queryKey: ['bot-health-check', botId],
    queryFn: defineQueryFn<BotHealthSamplesResp, BotPluginStatusStatics[]>(
      async () =>
        await jsonQ.Get<BotHealthSamplesResp>(
          `/bot/health-check/${botId}/sample`,
        ),
    ),
  })
}
