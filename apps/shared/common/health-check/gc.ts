import z from 'zod'
import { ZodCheckStatisticalSummary } from './base'

// GC指标 Schema
export const ZodCheckGCMetric = z.object({
  timestamp: z.number(),
  type: z.string(),
  duration: z.number(),
  flags: z.number(),
})
export type GCMetric = z.infer<typeof ZodCheckGCMetric>

// GC快照 Schema
export const ZodCheckGCSnapshot = z.object({
  recentGCs: z.array(ZodCheckGCMetric),
  frequency: z.number(),
  pressureScore: z.number(),
})
export type GCSnapshot = z.infer<typeof ZodCheckGCSnapshot>

// GC统计 Schema
export const ZodCheckGCStatistics = z.object({
  frequency: z.number(),
  duration: ZodCheckStatisticalSummary.nullable(),
  typeFrequency: z.record(z.string(), z.number()),
  pressureScore: z.number(),
})
export type GCStatistics = z.infer<typeof ZodCheckGCStatistics>
