import z from 'zod'
// request auth
export const ZodCheckWsAuthRequest = z.object({
  token: z.string().min(1, 'Token is required'),
})
export type WsAuthRequest = z.infer<typeof ZodCheckWsAuthRequest>

// request model type
export const ZodCheckWsAgentModel = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
}).optional()
export type WsAgentModel = z.infer<typeof ZodCheckWsAgentModel>

// message recovery context
export const ZodCheckWsAgentMessageRecoveryContext = z.object({
  appId: z.string().min(1, 'App ID is required'),
  socketSessionId: z.string().min(1, 'Socket Session ID is required'),
}).optional()
export type WsAgentMessageRecoveryContext = z.infer<
  typeof ZodCheckWsAgentMessageRecoveryContext
>

// request
export const ZodCheckWsAgentConnectionRequest = z.tuple([
  ZodCheckWsAuthRequest,
  ZodCheckWsAgentModel,
  ZodCheckWsAgentMessageRecoveryContext,
]).superRefine((args, ctx) => {
  const [, modelReq, recoveryReq] = args
  if (!modelReq && !recoveryReq) {
    ctx.addIssue({
      code: 'custom',
      message: 'Either model configuration or recovery context must be provided',
      fatal: true,
    })
  }
})
export type WsConnectionRequest = z.infer<
  typeof ZodCheckWsAgentConnectionRequest
>
