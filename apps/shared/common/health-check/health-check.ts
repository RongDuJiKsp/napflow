import z from 'zod'
import { ZodCheckMemoryStatistics } from './mem'
import { ZodCheckCPUStatistics } from './cpu'
import { ZodCheckEventLoopStatistics } from './event-loop'
import { ZodCheckGCMetric, ZodCheckGCStatistics } from './gc'
import { ZodCheckMemoryMetric } from './mem'
import { ZodCheckCPUMetric } from './cpu'
import { ZodCheckEventLoopMetric } from './event-loop'

// 聚合指标 Schema
export const ZodCheckAggregatedMetrics = z.object({
  sampleAtMs: z.number(),
  memory: ZodCheckMemoryStatistics.nullable(),
  cpu: ZodCheckCPUStatistics.nullable(),
  eventLoop: ZodCheckEventLoopStatistics.nullable(),
  gc: ZodCheckGCStatistics.nullable(),
})
export type AggregatedMetrics = z.infer<typeof ZodCheckAggregatedMetrics>

// 实时采样响应 Schema
export const ZodCheckRealTimeSamples = z.object({
  memory: z.array(ZodCheckMemoryMetric),
  cpu: z.array(ZodCheckCPUMetric),
  eventLoop: z.array(ZodCheckEventLoopMetric),
  gc: z.array(ZodCheckGCMetric),
  timestamp: z.number(),
  note: z.string(),
})
export type RealTimeSamples = z.infer<typeof ZodCheckRealTimeSamples>

// 健康状态枚举
export const HealthStatus = {
  healthy: 'healthy',
  warning: 'warning',
  critical: 'critical',
} as const
export type HealthStatusType = (typeof HealthStatus)[keyof typeof HealthStatus]

// 健康摘要详情 Schema
export const ZodCheckHealthSummaryDetails = z.object({
  memory: z
    .object({
      heapUtilization: z.string(),
    })
    .nullable(),
  cpu: z
    .object({
      avgLoad: z.string(),
      maxLoad: z.string(),
    })
    .nullable(),
  eventLoop: z
    .object({
      health: z.string(),
      avgDelay: z.string(),
    })
    .nullable(),
  gc: z
    .object({
      pressureScore: z.number(),
      frequency: z.number(),
      avgDuration: z.string(),
    })
    .nullable(),
})
export type HealthSummaryDetails = z.infer<typeof ZodCheckHealthSummaryDetails>

// 健康摘要 Schema
export const ZodCheckHealthSummary = z.object({
  status: z.enum(['healthy', 'warning', 'critical']),
  score: z.number(),
  timestamp: z.number(),
  details: ZodCheckHealthSummaryDetails,
})
export type HealthSummary = z.infer<typeof ZodCheckHealthSummary>
