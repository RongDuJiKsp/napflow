import z from 'zod'
import { NodeClassic } from './base'
import { ZodCheckXYPosition } from './re-export'

// node和edge里面许多需要透传的data 所以使用looseObject
export const ZodCheckNode = z.looseObject({
  id: z.string(),
  position: ZodCheckXYPosition,
  data: z.any(),
  type: z.enum(NodeClassic),
}).catchall(z.any())

export type Node = z.infer<typeof ZodCheckNode>

export const ZodCheckEdge = z.looseObject({
  id: z.string(),
  source: z.string(),
  target: z.string(),
}).catchall(z.any())
export type Edge = z.infer<typeof ZodCheckEdge>
