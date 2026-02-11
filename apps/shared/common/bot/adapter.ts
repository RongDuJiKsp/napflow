import z from 'zod'

export const ZodCheckBotWorkflowAppBindingConfig = z.object({
  envKV: z.record(z.string(), z.any()),
}).partial()
export type BotWorkflowAppBindingConfig = z.infer<typeof ZodCheckBotWorkflowAppBindingConfig>

export const ZodCheckCommonAdapterConfig = z.object({
  autoStart: z.boolean(),
  bindingWorkflowApp: z.array(z.object({
    bindingId: z.uuid(),
    appId: z.string(),
    version: z.string(),
    bindingConfig: ZodCheckBotWorkflowAppBindingConfig.optional(),
  })),
}).partial()
export type CommonAdapterConfig = z.infer<typeof ZodCheckCommonAdapterConfig>
