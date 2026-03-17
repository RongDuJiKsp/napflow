import z from 'zod'

// loop-start 节点没有用户可配置的数据字段
// 它是 loop 节点创建时自动生成的子节点
export const LoopStartDataSchema = z.object({})

export type LoopStartData = z.infer<typeof LoopStartDataSchema>
