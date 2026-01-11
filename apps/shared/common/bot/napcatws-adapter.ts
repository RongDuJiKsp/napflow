import z from 'zod'

export const ZodCheckNapcatWsAdapterConfig = z.object({
  endpoint: z.object({
    wsUrl: z.url(),
    token: z.string().optional(),
  }),
  retryConfig: z.object({
    retryMaxTimes: z.number(),
    retryDelay: z.number(),
  }).optional(),
})
export type NapcatWsAdapterConfig = z.infer<typeof ZodCheckNapcatWsAdapterConfig>
