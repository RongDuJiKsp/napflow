import z from 'zod'

// iterate-start 节点没有用户可配置的数据字段
// 它是 iterate 节点创建时自动生成的子节点
export const IterateStartDataSchema = z.object({})

export type IterateStartData = z.infer<typeof IterateStartDataSchema>
