import z from 'zod'

// 建议所有kv都是optional
export const ZodCheckCommonAdapterConfig = z.object({
  autoStart: z.boolean(),
  bindingWorkflowApp: z.array(z.object({
    bindingId: z.uuid(),
    appId: z.string(),
    version: z.string(),
  })),
}).partial()
export type CommonAdapterConfig = z.infer<typeof ZodCheckCommonAdapterConfig>
