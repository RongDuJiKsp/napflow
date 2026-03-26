import z from 'zod'
import { defineZodResp } from '../_base'

export const ZodCheckRecoverableAgentSessionItem = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  title: z.string().min(1, 'Title is required'),
  createdAt: z.date(),
})
export type RecoverableAgentSessionItem = z.infer<
  typeof ZodCheckRecoverableAgentSessionItem
>

// @/agent/session/recover/:appId/list
export const ZodCheckGetRecoverableAgentSessionListResp = defineZodResp(
  z.array(ZodCheckRecoverableAgentSessionItem),
)
export type GetRecoverableAgentSessionListResp = z.infer<
  typeof ZodCheckGetRecoverableAgentSessionListResp
>
