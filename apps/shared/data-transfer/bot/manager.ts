import z from 'zod'
import { defineZodResp } from '../_base'
import { AdapterTag, ZodCheckCommonBotInfo } from '../../common/bot/base'
import { ZodCheckCommonAdapterConfig } from '../../common/bot/adapter'

// @/bots/list
export const ZodCheckGetAllBotsResp = defineZodResp(
  z.array(ZodCheckCommonBotInfo),
)
export type GetAllBotsResp = z.infer<typeof ZodCheckGetAllBotsResp>

// @/bots/create
export const ZodCheckCreateBotReq = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  commonConfig: ZodCheckCommonAdapterConfig,
  adapterTag: z.enum(AdapterTag),
  adapterConfig: z.looseObject({}).catchall(z.any()),
})
export type CreateBotReq = z.infer<typeof ZodCheckCreateBotReq>

// @/bots/create
export const ZodCheckCreateBotResp = defineZodResp(
  z.object({
    botId: z.string(),
  }),
)
export type CreateBotResp = z.infer<typeof ZodCheckCreateBotResp>
