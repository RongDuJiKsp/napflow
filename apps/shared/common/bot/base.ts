import z from 'zod'
import { ZodCheckBot } from './entity'
import { ZodCheckBotState } from './core/status'

export const ZodCheckCommonBotInfo = ZodCheckBot.extend({
  state: ZodCheckBotState,
  adapterDesc: z.string(),
  botDesc: z.string(),
})
export type CommonBotInfo = z.infer<typeof ZodCheckCommonBotInfo>
