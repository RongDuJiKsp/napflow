import z from 'zod'
import { ZodCheckStatisticalSummary } from './base'

// 进程内存使用 Schema（对应NodeJS.MemoryUsage）
export const ZodCheckProcessMemoryUsage = z.object({
  rss: z.number(),
  heapTotal: z.number(),
  heapUsed: z.number(),
  external: z.number(),
  arrayBuffers: z.number(),
})
export type ProcessMemoryUsage = z.infer<typeof ZodCheckProcessMemoryUsage>

// V8堆信息 Schema（对应v8.HeapInfo）
export const ZodCheckV8HeapInfo = z.object({
  total_heap_size: z.number(),
  total_heap_size_executable: z.number(),
  total_physical_size: z.number(),
  total_available_size: z.number(),
  used_heap_size: z.number(),
  heap_size_limit: z.number(),
  malloced_memory: z.number(),
  peak_malloced_memory: z.number(),
  does_zap_garbage: z.number(),
  number_of_native_contexts: z.number(),
  number_of_detached_contexts: z.number(),
  total_global_handles_size: z.number(),
  used_global_handles_size: z.number(),
  external_memory: z.number(),
})
export type V8HeapInfo = z.infer<typeof ZodCheckV8HeapInfo>

// 内存指标 Schema
export const ZodCheckMemoryMetric = z.object({
  timestamp: z.number(),
  process: ZodCheckProcessMemoryUsage,
  v8: ZodCheckV8HeapInfo,
})
export type MemoryMetric = z.infer<typeof ZodCheckMemoryMetric>

// 内存统计 Schema
export const ZodCheckMemoryStatistics = z.object({
  heapUsed: ZodCheckStatisticalSummary,
  rss: ZodCheckStatisticalSummary,
  heapTotal: ZodCheckStatisticalSummary,
  utilization: ZodCheckStatisticalSummary,
})
export type MemoryStatistics = z.infer<typeof ZodCheckMemoryStatistics>
