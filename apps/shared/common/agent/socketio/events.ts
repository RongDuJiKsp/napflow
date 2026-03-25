import z from 'zod'

export const ZodCheckWsMessageEventChatQuery = z.object({
  query: z.string().min(1, 'Query is required'),
})
export type WsMessageEventChatQuery = z.infer<
  typeof ZodCheckWsMessageEventChatQuery
>
