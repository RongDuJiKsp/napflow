export type OpenAIApiModelConfig = {
  id: string
  endpoint: string
  apiKey: string
  model: string
}

export type OpenAIApiModelInput = Omit<OpenAIApiModelConfig, 'id'>
