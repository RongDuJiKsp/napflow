import z from 'zod'

export const ZodCheckCommonAdapterConfig = z.object({
  autoStart: z.boolean().optional(),
})
export type CommonAdapterConfig = z.infer<typeof ZodCheckCommonAdapterConfig>
