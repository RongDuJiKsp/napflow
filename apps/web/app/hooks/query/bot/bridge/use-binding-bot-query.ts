import { useQuery } from '@tanstack/react-query'
import { defineZodQueryFn } from '../../_base'
import { ZodCheckBotBridgeBindStatusResp } from '@shared/data-transfer/bot/bridge'
import type { BotBridgeBindStatusResp } from '@shared/data-transfer/bot/bridge'
import { jsonQ } from '@/utils/net'

export const useBindingBotQuery = (botId: string) => {
  return useQuery({
    queryKey: ['binding-bot', botId],
    queryFn: defineZodQueryFn(
      ZodCheckBotBridgeBindStatusResp,
      async () =>
        await jsonQ.Get<BotBridgeBindStatusResp>(
          `/bot/bridge/${botId}/binding`,
        ),
    ),
  })
}
