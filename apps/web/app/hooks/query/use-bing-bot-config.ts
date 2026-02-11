import { useQuery } from '@tanstack/react-query'
import { defineQueryFn } from './_base'
import type { BotWorkflowAppBindingConfig } from '@shared/common/bot/adapter'
import type { BotBindingConfigResp } from '@shared/data-transfer/bot/bridge'
import { jsonQ } from '@/utils/net'

export const useBingBotConfig = (botId: string, bindingId: string) => {
  return useQuery({
    queryKey: ['bing-bot-config', botId, bindingId],
    queryFn: defineQueryFn<BotBindingConfigResp, BotWorkflowAppBindingConfig>(async () => await jsonQ.Get<BotBindingConfigResp>(`/${botId}/bindingconfig/${bindingId}`)),
  })
}
