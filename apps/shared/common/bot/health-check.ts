import z from 'zod'
import { ZodCheckStatisticalSummary } from '../health-check/base'

export const ZocCheckBotPluginStatusSnapshot = z.object({
  taskQueueLength: z.number(), // 任务队列长度 即有几个被触发器生成的实例
  nodeQueueLength: z.number(), // 节点队列长度 即有几个节点在执行队列
})
export type BotPluginStatusSnapshot = z.infer<typeof ZocCheckBotPluginStatusSnapshot>

export const ZocCheckBotPluginStatusStatics = z.object({
  sampleAtMs: z.number(),
  taskQueueLength: ZodCheckStatisticalSummary,
  nodeQueueLength: ZodCheckStatisticalSummary,
})
export type BotPluginStatusStatics = z.infer<typeof ZocCheckBotPluginStatusStatics>
