import z from 'zod'

export const LoopDataSchema = z.object({
  maxCount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const num = Number(val)
        return Number.isNaN(num) ? val : num
      }
      return val
    },
    z.number().int().min(1, '循环次数至少为1'),
  ),
})

export type LoopData = z.infer<typeof LoopDataSchema>
