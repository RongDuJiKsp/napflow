import z from 'zod'
import { ZodCheckStatisticalSummary } from './base'

// 事件循环指标 Schema
// 单位 毫秒(ms)
export const ZodCheckEventLoopMetric = z.object({
  timestamp: z.number(),
  min: z.number(),
  max: z.number(),
  mean: z.number(),
  p50: z.number(),
  p90: z.number(),
  p99: z.number(),
  p999: z.number(),
})
export type EventLoopMetric = z.infer<typeof ZodCheckEventLoopMetric>

// 事件循环统计 Schema
export const ZodCheckEventLoopStatistics = z.object({
  mean: ZodCheckStatisticalSummary,
  max: ZodCheckStatisticalSummary,
  healthScore: z.number(),
})
export type EventLoopStatistics = z.infer<typeof ZodCheckEventLoopStatistics>
