import z from 'zod'
import { ZodCheckWorkflowAppVersionMeta } from '../../common/workflow/base'
import { defineZodResp } from '../_base'
export const ZodCheckBotBridgeBindReq = z.array(z.object({
  appId: z.string(),
  appVersion: z.string(),
}))
export type BotBridgeBindReq = z.infer<typeof ZodCheckBotBridgeBindReq>

export const ZodCheckBotBridgeUnbindReq = z.object({
  bindingIds: z.array(z.string()),
})
export type BotBridgeUnbindReq = z.infer<typeof ZodCheckBotBridgeUnbindReq>

export const ZodCheckBotBridgeBindStatusResp = defineZodResp(
  z.array(ZodCheckWorkflowAppVersionMeta),
)
export type BotBridgeBindStatusResp = z.infer<typeof ZodCheckBotBridgeBindStatusResp>
