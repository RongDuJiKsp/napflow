import z from 'zod'
import { defineZodResp } from '../_base'
import { ZodCheckCommonBotInfo } from '../../common/bot/base'
import { AdapterTag } from '../../common/bot/core/adapter'
import { ZodCheckCommonAdapterConfig } from '../../common/bot/core/config'

// @/bot/record/list
export const ZodCheckGetAllBotsResp = defineZodResp(
  z.array(ZodCheckCommonBotInfo),
)
export type GetAllBotsResp = z.infer<typeof ZodCheckGetAllBotsResp>

// @/bot/record/create
export const ZodCheckCreateBotReq = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  commonConfig: ZodCheckCommonAdapterConfig,
  adapterTag: z.enum(AdapterTag),
  adapterConfig: z.looseObject({}).catchall(z.any()),
})
export type CreateBotReq = z.infer<typeof ZodCheckCreateBotReq>

// @/bot/record/create
export const ZodCheckCreateBotResp = defineZodResp(
  z.object({
    botId: z.string(),
  }),
)
export type CreateBotResp = z.infer<typeof ZodCheckCreateBotResp>

// @/bot/record/:botId/update
export const ZodCheckUpdateBotReq = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
})
export type UpdateBotReq = z.infer<typeof ZodCheckUpdateBotReq>
