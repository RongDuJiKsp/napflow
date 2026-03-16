import z from 'zod'

const TimeExprSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)

export const TimerDataSchema = z.object({
  timeExpr: z.string().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: 'custom',
        message: 'timeExpr不能为空',
      })
      return
    }

    // 允许变量引用，格式由运行时模板解析。
    if (value.includes('$')) return

    if (!TimeExprSchema.safeParse(value).success) {
      ctx.addIssue({
        code: 'custom',
        message: 'timeExpr格式必须为HH:mm或HH:mm:ss，或使用变量引用',
      })
    }
  }),
})

export type TimerData = z.infer<typeof TimerDataSchema>
