import { useQuery } from '@tanstack/react-query'
import { defineZodQueryFn } from '../../_base'
import { ZodCheckBotBindingConfigResp } from '@shared/data-transfer/bot/bridge'
import type { BotBindingConfigResp } from '@shared/data-transfer/bot/bridge'
import { jsonQ } from '@/utils/net'

export const useBindingBotConfigQuery = (botId: string, bindingId: string) => {
  return useQuery({
    queryKey: ['binding-bot-config', botId, bindingId],
    queryFn: defineZodQueryFn(
      ZodCheckBotBindingConfigResp,
      async () =>
        await jsonQ.Get<BotBindingConfigResp>(
          `/bot/bridge/${botId}/bindingconfig/${bindingId}`,
        ),
    ),
  })
}
