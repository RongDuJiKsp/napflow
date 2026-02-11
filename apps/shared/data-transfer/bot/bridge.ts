import z from 'zod'
import { ZodCheckWorkflowApp, ZodCheckWorkflowAppVersionInfos } from '../../common/workflow/base'
import { defineZodResp } from '../_base'
import { ZodCheckBotWorkflowAppBindingConfig } from '@shared/common/bot/adapter'
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
  z.array(z.object({
    appId: z.string(),
    version: z.string(),
    bindingId: z.string(),
    app: ZodCheckWorkflowApp,
    appPublish: ZodCheckWorkflowAppVersionInfos,
  })),
)
export type BotBridgeBindStatusResp = z.infer<typeof ZodCheckBotBridgeBindStatusResp>

export const ZodCheckBotBindingConfigResp = defineZodResp(ZodCheckBotWorkflowAppBindingConfig)
export type BotBindingConfigResp = z.infer<typeof ZodCheckBotBindingConfigResp>
