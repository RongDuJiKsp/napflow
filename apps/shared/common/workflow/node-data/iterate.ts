import z from 'zod'

export const IterateDataSchema = z.object({
  // 变量格式：sourceId.varName，例如 trigger.msgs
  sourceVarName: z.string().min(1, '请选择一个数组变量'),
})

export type IterateData = z.infer<typeof IterateDataSchema>
