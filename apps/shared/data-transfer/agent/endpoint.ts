import z from 'zod'
import { defineZodResp } from '../_base'
import {
  ZodCheckOpenAiEndpointConfig,
  ZodCheckOpenAiEndpointConfigRecord,
} from '@shared/common/agent/entity'

// @/agent/openai-endpoint
export const ZodCheckGetOpenAiEndpointListResp = defineZodResp(
  z.array(ZodCheckOpenAiEndpointConfigRecord),
)
export type GetOpenAiEndpointListResp = z.infer<
  typeof ZodCheckGetOpenAiEndpointListResp
>

// @/agent/openai-endpoint/create
export const ZodCheckCreateOpenAiEndpointReq = ZodCheckOpenAiEndpointConfig
export type CreateOpenAiEndpointReq = z.infer<
  typeof ZodCheckCreateOpenAiEndpointReq
>

// @/agent/openai-endpoint/:id/update
export const ZodCheckUpdateOpenAiEndpointReq
  = ZodCheckOpenAiEndpointConfig.partial()
export type UpdateOpenAiEndpointReq = z.infer<
  typeof ZodCheckUpdateOpenAiEndpointReq
>

// @/agent/openai-endpoint/create
export const ZodCheckCreateOpenAiEndpointResp = defineZodResp(
  z.object({
    id: z.string(),
  }),
)
export type CreateOpenAiEndpointResp = z.infer<
  typeof ZodCheckCreateOpenAiEndpointResp
>
