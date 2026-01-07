import z from 'zod'

export const ZodCheckXYPosition = z.object({
  x: z.number(),
  y: z.number(),
})
export type XYPosition = z.infer<typeof ZodCheckXYPosition>
