import z from 'zod'

export const ZodCheckOpenAiEndpointConfigRecord = z
  .object({
    id: z.string().min(1, 'ID is required'),
    endpoint: z.string().min(1, 'Endpoint is required'),
    apiKey: z.string().min(1, 'API Key is required'),
    model: z.string().min(1, 'Model is required'),
  })

export type OpenAiEndpointConfigRecord = z.infer<typeof ZodCheckOpenAiEndpointConfigRecord>

export const ZodCheckOpenAiEndpointConfig = ZodCheckOpenAiEndpointConfigRecord.omit({
  id: true,
})
export type OpenAiEndpointConfig = z.infer<typeof ZodCheckOpenAiEndpointConfig>
