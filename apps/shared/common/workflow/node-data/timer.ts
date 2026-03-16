import z from 'zod'

export enum TimerTriggerMode {
  Schedule = 'schedule',
  Interval = 'interval',
}

const TimeExprSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

export const TimerDataSchema = z
  .object({
    mode: z.enum(TimerTriggerMode),
    timeExpr: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.timeExpr) {
      ctx.addIssue({
        code: 'custom',
        message: 'timeExpr不能为空',
        path: ['timeExpr'],
      })
      return
    }

    // 允许变量引用，格式由运行时模板解析。
    if (data.timeExpr.includes('$')) return

    if (data.mode === TimerTriggerMode.Schedule) {
      if (!TimeExprSchema.safeParse(data.timeExpr).success) {
        ctx.addIssue({
          code: 'custom',
          message: 'timeExpr格式必须为HH:mm，或使用变量引用',
          path: ['timeExpr'],
        })
      }
      return
    }

    const asNumber = Number(data.timeExpr)
    if (Number.isNaN(asNumber) || !Number.isFinite(asNumber)) {
      ctx.addIssue({
        code: 'custom',
        message: '间隔模式下 timeExpr 必须是可用数字，或使用变量引用',
        path: ['timeExpr'],
      })
    }
  })

export type TimerData = z.infer<typeof TimerDataSchema>
