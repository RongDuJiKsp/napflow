import z from 'zod'
import { AdapterTag } from './core/adapter'
import { ZodCheckCommonAdapterConfig } from './core/config'

export const ZodCheckBot = z.object({
  botId: z.string().uuid(),
  botName: z.string(),
  description: z.string(),
  commonAdapterConfig: ZodCheckCommonAdapterConfig,
  adapterTag: z.enum(AdapterTag),
  adapterConfig: z.record(z.string(), z.any()),
  createdAt: z.date(),
  createdBy: z.string(),
})
export type Bot = z.infer<typeof ZodCheckBot>
