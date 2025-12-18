import z from 'zod'

export const XYPosition = z.object({
  x: z.number(),
  y: z.number(),
})

export const NodeClassic = z.enum(['component', 'note'])

export const Node = z.object({
  id: z.string(),
  position: XYPosition,
  data: z.object(),
  type: NodeClassic,
})

export const Edge = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
})
