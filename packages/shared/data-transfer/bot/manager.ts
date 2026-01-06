import z from 'zod'
import { defineZodResp } from '../_base'
import { ZodCheckCommonBotInfo } from './_base'

export const ZodCheckGetAllBotsResp = defineZodResp(z.array(
  ZodCheckCommonBotInfo,
))
export type GetAllBotsResp = z.infer<typeof ZodCheckGetAllBotsResp>
