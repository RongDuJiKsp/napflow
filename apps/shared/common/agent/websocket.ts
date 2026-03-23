import z from 'zod'
// request auth
export const ZodCheckWsAuthRequest = z.object({
  token: z.string().min(1, 'Token is required'),
})
export type WsAuthRequest = z.infer<typeof ZodCheckWsAuthRequest>

// request model type
export const ZodCheckWsAgentModel = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
})
export type WsAgentModel = z.infer<typeof ZodCheckWsAgentModel>

// request
export const ZodCheckWsAgentConnectionRequest = z.tuple([
  ZodCheckWsAuthRequest,
  ZodCheckWsAgentModel,
])
export type WsConnectionRequest = z.infer<
  typeof ZodCheckWsAgentConnectionRequest
>
