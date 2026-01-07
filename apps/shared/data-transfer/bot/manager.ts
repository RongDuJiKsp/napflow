import z from 'zod'
import { defineZodResp } from '../_base'
import { AdapterTag, ZodCheckCommonBotInfo } from './_base'

export const ZodCheckGetAllBotsResp = defineZodResp(z.array(
  ZodCheckCommonBotInfo,
))
export type GetAllBotsResp = z.infer<typeof ZodCheckGetAllBotsResp>

export const ZodCheckCreateBotReq = z.object({
  name: z.string(),
  description: z.string(),
  adapterTag: z.enum(AdapterTag),
  adapterConfig: z.looseObject({}),
})
export type CreateBotReq = z.infer<typeof ZodCheckCreateBotReq>

export const ZodCheckCreateBotResp = defineZodResp(z.object({
  botId: z.string(),
}))
export type CreateBotResp = z.infer<typeof ZodCheckCreateBotResp>
