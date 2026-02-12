import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from './_base'
import type { BotBridgeBindStatusResp } from '@shared/data-transfer/bot/bridge'
import { jsonQ } from '@/utils/net'

export const useBindingBotQuery = (botId: string) => {
  return useQuery({
    queryKey: ['binding-bot', botId],
    queryFn: defineQueryFn<
      BotBridgeBindStatusResp,
      NonNullable<BotBridgeBindStatusResp['data']>
    >(
      async () =>
        await jsonQ.Get<BotBridgeBindStatusResp>(
          `/bot-bridge/${botId}/binding`,
        ),
    ),
  })
}
