import z from 'zod'

export const ZodCheckOpenAiEndpointConfig = z
  .object({
    endpoint: z.string().min(1, 'Endpoint is required'),
    apiKey: z.string().min(1, 'API Key is required'),
    model: z.string().min(1, 'Model is required'),
  })

export type OpenAiEndpointConfig = z.infer<typeof ZodCheckOpenAiEndpointConfig>

export const ZodCheckOpenAiEndpointConfigRecord = ZodCheckOpenAiEndpointConfig.extend({
  id: z.string().min(1, 'ID is required'),
})
export type OpenAiEndpointConfigRecord = z.infer<typeof ZodCheckOpenAiEndpointConfigRecord>