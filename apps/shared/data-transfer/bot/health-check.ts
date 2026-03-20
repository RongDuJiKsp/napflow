import { defineZodResp } from '../_base'
import { ZocCheckBotPluginStatusStatics } from '../../common/bot/health-check'
import z from 'zod'

// @/bot/health-check/:botId/sample
export const ZodCheckBotHealthSamplesResp = defineZodResp(
  z.array(ZocCheckBotPluginStatusStatics),
)
export type BotHealthSamplesResp = z.infer<typeof ZodCheckBotHealthSamplesResp>
