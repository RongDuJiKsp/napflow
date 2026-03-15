import z from 'zod'

// raw object schema，不含 superRefine，供 server 端 extend 使用
export const ArrayIndexReadDataRawSchema = z.object({
  sourceVarName: z.string().min(1, '请选择一个数组变量'),
  index: z.string().min(1, '请输入索引'),
})

export const ArrayIndexReadDataSchema = ArrayIndexReadDataRawSchema

export type ArrayIndexReadData = z.infer<typeof ArrayIndexReadDataSchema>
