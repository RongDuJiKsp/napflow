import z from 'zod'
import { ZodCheckStatisticalSummary } from './base'

// CPU指标 Schema
export const ZodCheckCPUMetric = z.object({
  timestamp: z.number(),
  userPercent: z.number(),
  systemPercent: z.number(),
  totalPercent: z.number(),
})
export type CPUMetric = z.infer<typeof ZodCheckCPUMetric>

// CPU统计 Schema
export const ZodCheckCPUStatistics = z.object({
  user: ZodCheckStatisticalSummary,
  system: ZodCheckStatisticalSummary,
  total: ZodCheckStatisticalSummary,
})
export type CPUStatistics = z.infer<typeof ZodCheckCPUStatistics>
