import z from 'zod'

export const ZodCheckNapcatWsAdapterConfig = z.object({
  endpoint: z.object({
    wsUrl: z.string(),
    token: z.string().optional(),
  }),
})
export type NapcatWsAdapterConfig = z.infer<typeof ZodCheckNapcatWsAdapterConfig>
