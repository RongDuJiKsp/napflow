import z from 'zod'

// base
export const ZodRpcNullRequest = z.tuple([])
export const ZodRpcBaseResponse = z.object({
  success: z.boolean(),
})
