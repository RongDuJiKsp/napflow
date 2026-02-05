import z from 'zod'

// 统计摘要 Schema
export const ZodCheckStatisticalSummary = z.object({
  min: z.number(),
  max: z.number(),
  mean: z.number(),
  median: z.number(),
  p95: z.number(),
})
export type StatisticalSummary = z.infer<typeof ZodCheckStatisticalSummary>
