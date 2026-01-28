import z from 'zod'
import { ZodCheckWorkflowAppVersionMeta } from '../../common/workflow/base'
export const ZodCheckBotBridgeBindReq = z.array(z.object({
  appId: z.string(),
  appVersion: z.string(),
}))
export type BotBridgeBindReq = z.infer<typeof ZodCheckBotBridgeBindReq>

export const ZodCheckBotBridgeBindStatusResp = z.object({
  target: z.array(ZodCheckWorkflowAppVersionMeta),
})
export type BotBridgeBindStatusResp = z.infer<typeof ZodCheckBotBridgeBindStatusResp>
