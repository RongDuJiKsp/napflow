import z from 'zod'

export const ZodCheckCommonAdapterConfig = z.object({
  autoStart: z.boolean().optional(),
  bindingWorkflowApp: z.array(z.object({
    appId: z.string(),
    version: z.string(),
  })),
})
export type CommonAdapterConfig = z.infer<typeof ZodCheckCommonAdapterConfig>
