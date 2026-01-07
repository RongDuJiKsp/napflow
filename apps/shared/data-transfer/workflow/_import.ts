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
  data: z.any(),
  type: z.enum(NodeClassic),
}).and(z.record(z.string(), z.any()))

export type Node = z.infer<typeof ZodCheckNode>

export const ZodCheckEdge = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
}).and()
export type Edge = z.infer<typeof ZodCheckEdge>
