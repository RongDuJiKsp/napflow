import z from 'zod'
import { defineZodResp } from '../_base'
import { CommonBotInfo } from './_base'

// /bots/list
export const GetAllBotsResp = defineZodResp(z.array(
  CommonBotInfo,
))
export type GetAllBotsRespType = z.infer<typeof GetAllBotsResp>
