import z from 'zod'

export const ZodCheckXYPosition = z.object({
  x: z.number(),
  y: z.number(),
})
export type XYPosition = z.infer<typeof ZodCheckXYPosition>

export const ZodCheckNodeClassic = z.enum(['component', 'note'])
export type NodeClassic = z.infer<typeof ZodCheckNodeClassic>

export const ZodCheckNode = z.object({
  id: z.string(),
  position: ZodCheckXYPosition,
  data: z.object(),
  type: ZodCheckNodeClassic,
})
export type Node = z.infer<typeof ZodCheckNode>

export const ZodCheckEdge = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
})
export type Edge = z.infer<typeof ZodCheckEdge>
