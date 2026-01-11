import z from 'zod'

export const ZodCheckNapcatWsAdapterConfig = z.object({
  endpoint: z.object({
    wsUrl: z.url(),
    token: z.string().optional(),
  }),
  retryConfig: z.object({
    retryMaxTimes: z.number().min(0),
    retryDelay: z.number().min(1000),
  }).optional(),
})
export type NapcatWsAdapterConfig = z.infer<typeof ZodCheckNapcatWsAdapterConfig>
