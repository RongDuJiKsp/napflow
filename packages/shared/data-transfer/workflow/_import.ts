import z from 'zod'
import { NodeClassic } from './base'

export const ZodCheckXYPosition = z.object({
  x: z.number(),
  y: z.number(),
})
export type XYPosition = z.infer<typeof ZodCheckXYPosition>

// node和edge里面许多需要透传的data 所以使用looseObject
export const ZodCheckNode = z.looseObject({
  id: z.string(),
  position: ZodCheckXYPosition,
  data: z.looseObject({}),
  type: z.enum(NodeClassic),
})
export type Node = z.infer<typeof ZodCheckNode>

export const ZodCheckEdge = z.looseObject({
  id: z.string(),
  source: z.string(),
  target: z.string(),
})
export type Edge = z.infer<typeof ZodCheckEdge>
