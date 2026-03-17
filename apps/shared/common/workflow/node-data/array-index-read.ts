import z from 'zod'

export const ArrayIndexReadDataSchema = z.object({
  sourceVarName: z.string().min(1, '请选择一个数组变量'),
  index: z.string().min(1, '请输入索引'),
})

export type ArrayIndexReadData = z.infer<typeof ArrayIndexReadDataSchema>
