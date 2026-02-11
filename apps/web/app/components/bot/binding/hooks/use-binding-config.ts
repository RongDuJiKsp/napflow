import { useCallback } from 'react'
import { useBotParam } from '../../hooks/use-bot-param'
import { useSubmitZodFn } from '@/app/hooks/utils/use-form'
import type { BotWorkflowAppBindingConfig } from '@shared/common/bot/adapter'
import { ZodCheckBotWorkflowAppBindingConfig } from '@shared/common/bot/adapter'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'

export const useBindingConfig = (bindingId: string) => {
  const { botId } = useBotParam()
  const submitReqFn = useCallback(async (data: BotWorkflowAppBindingConfig) => await jsonQ.Post<NullResp>(`/${botId}/bindingconfig/${bindingId}`, data), [botId, bindingId])
  const submitConfig = useSubmitZodFn(ZodCheckBotWorkflowAppBindingConfig, submitReqFn)
  return {
    submitConfig,
  }
}
