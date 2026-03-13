import z from 'zod'

export const DifyDataSchema = z.object({
  baseUrl: z.string().min(1, '请输入 Dify API 地址'),
  apiKey: z.string().min(1, '请输入 Dify API Key'),
  query: z.string().min(1, '请输入请求内容'),

})

export type DifyData = z.infer<typeof DifyDataSchema>
