import z from 'zod'

export const ZodCheckWorkflowNodeDataExtra = z.object({
  expanded: z.boolean(),
})
export type WorkflowNodeDataExtra = z.infer<
  typeof ZodCheckWorkflowNodeDataExtra
>

// 私有数据,要求_开头
export const ZodCheckWorkflowNodeDataPrivate = z.object({
  _cacheKV: z.record(z.string(), z.any()),
  _beforeCreate: z.boolean().optional(),
})
export type WorkflowNodeDataPrivate = z.infer<
  typeof ZodCheckWorkflowNodeDataPrivate
>

export const ZodCheckWorkflowEdgeDataPrivate = z.object({
  _cacheKV: z.record(z.string(), z.any()),
})
export type WorkflowEdgeDataPrivate = z.infer<
  typeof ZodCheckWorkflowEdgeDataPrivate
>

// 完整的类型

// meta
export const ZodCheckWorkflowNodeMeta = ZodCheckWorkflowNodeDataPrivate.extend(
  ZodCheckWorkflowNodeDataExtra.shape,
)
export type WorkflowNodeMeta = z.infer<typeof ZodCheckWorkflowNodeMeta>

export const ZodCheckWorkflowEdgeMeta = ZodCheckWorkflowEdgeDataPrivate
export type WorkflowEdgeMeta = z.infer<typeof ZodCheckWorkflowEdgeMeta>

// export

export const defineZodCheckWorkflowNodeData = <S extends z.ZodRawShape, T extends z.ZodObject<S>>(
  data: T,
) => ZodCheckWorkflowNodeMeta.extend(data.shape)
export const defineZodCheckWorkflowEdgeData = <S extends z.ZodRawShape, T extends z.ZodObject<S>>(
  data: T,
) => ZodCheckWorkflowEdgeMeta.extend(data.shape)

export type WorkflowNodeData<T = unknown> = T & WorkflowNodeMeta
export type WorkflowEdgeData<T = unknown> = T & WorkflowEdgeMeta
