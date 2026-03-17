import z from 'zod'

export enum DifyMode {
  Chatflow = 'chatflow',
  Workflow = 'workflow',
}

export const DifyInputEntrySchema = z.object({
  key: z.string().min(1, '字段名不能为空'),
  value: z.string(),
})
export type DifyInputEntry = z.infer<typeof DifyInputEntrySchema>

export const DifyDataSchema = z
  .object({
    mode: z.enum(DifyMode),
    baseUrl: z.string().min(1, '请输入 Dify API 地址'),
    apiKey: z.string().min(1, '请输入 Dify API Key'),
    query: z.string().optional(),
    inputs: z.array(DifyInputEntrySchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === DifyMode.Chatflow && !data.query) {
      ctx.addIssue({
        code: 'custom',
        message: '请输入请求内容',
        path: ['query'],
      })
    }
  })

export type DifyData = z.infer<typeof DifyDataSchema>
