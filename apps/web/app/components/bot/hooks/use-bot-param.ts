import { defineZodParamChecker } from '@/utils/next-client'
import { z } from 'zod'

export const ZodCheckBotParam = z.object({
  botId: z.string().min(1),
})
export type BotParam = z.infer<typeof ZodCheckBotParam>

export const useBotParam = defineZodParamChecker(ZodCheckBotParam)
