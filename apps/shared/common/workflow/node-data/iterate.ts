import z from 'zod'

// raw object schema，不含 superRefine，供 server 端 extend 使用
export const IterateDataRawSchema = z.object({
  // 变量格式：sourceId.varName，例如 trigger.msgs
  sourceVarName: z.string().min(1, '请选择一个数组变量'),
})

export const IterateDataSchema = IterateDataRawSchema

export type IterateData = z.infer<typeof IterateDataSchema>
