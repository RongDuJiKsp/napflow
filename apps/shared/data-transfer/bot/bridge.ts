import z from 'zod'
import { zodDeepPartial } from 'zod-deep-partial'
import { ZodCheckWorkflowAppVersionInfos } from '../../common/workflow/base'
import { ZodCheckWorkflowApp } from '../../common/workflow/entity'
import { defineZodResp } from '../_base'
import { ZodCheckBotWorkflowAppBindingConfig } from '@shared/common/bot/core/config'

// @/bot-bridge/:botId/bindmany
export const ZodCheckBotBridgeBindReq = z.array(
  z.object({
    appId: z.string(),
    appVersion: z.string(),
  }),
)
export type BotBridgeBindReq = z.infer<typeof ZodCheckBotBridgeBindReq>

// @/bot-bridge/:botId/unbindmany
export const ZodCheckBotBridgeUnbindReq = z.object({
  bindingIds: z.array(z.string()),
})
export type BotBridgeUnbindReq = z.infer<typeof ZodCheckBotBridgeUnbindReq>

// @/bot-bridge/:botId/binding
export const ZodCheckBotBridgeBindStatusResp = defineZodResp(
  z.array(
    z.object({
      appId: z.string(),
      version: z.string(),
      bindingId: z.string(),
      app: ZodCheckWorkflowApp,
      appPublish: ZodCheckWorkflowAppVersionInfos,
    }),
  ),
)
export type BotBridgeBindStatusResp = z.infer<
  typeof ZodCheckBotBridgeBindStatusResp
>

// @/bot-bridge/:botId/bindingconfig/:bindingId
export const ZodCheckConfigBotWorkflowAppBindingConfigReq = zodDeepPartial(
  ZodCheckBotWorkflowAppBindingConfig,
)
export type ConfigBotWorkflowAppBindingConfigReq = z.infer<
  typeof ZodCheckConfigBotWorkflowAppBindingConfigReq
>

// @/bot-bridge/:botId/bindingconfig/:bindingId
export const ZodCheckBotBindingConfigResp = defineZodResp(
  ZodCheckBotWorkflowAppBindingConfig,
)
export type BotBindingConfigResp = z.infer<typeof ZodCheckBotBindingConfigResp>
