import { defineZodResp } from '../_base'
import { ZocCheckBotPluginStatusStatics } from '../../common/bot/health-check'
import z from 'zod'
export const ZodCheckBotHealthSamplesResp = defineZodResp(
  z.array(ZocCheckBotPluginStatusStatics),
)
export type BotHealthSamplesResp = z.infer<typeof ZodCheckBotHealthSamplesResp>
