import z from 'zod'

// raw object schema，不含 superRefine，供 server 端 extend 使用
export const LoopDataRawSchema = z.object({
  maxCount: z.preprocess((val) => {
    if (typeof val === 'string') {
      const num = Number(val)
      return Number.isNaN(num) ? val : num
    }
    return val
  }, z.number().int().min(1, '循环次数至少为1')),
})

export const LoopDataSchema = LoopDataRawSchema

export type LoopData = z.infer<typeof LoopDataSchema>
