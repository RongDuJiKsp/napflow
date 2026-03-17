import z from 'zod'

export enum TimerTriggerMode {
  Schedule = 'schedule',
  Interval = 'interval',
}

const TimeExprRegex = /^([01]\d|2[0-3]):[0-5]\d$/
const TemplateVarSchema = /\{\{#[^#]+#\}\}/

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

    // 允许模板变量引用，格式与运行时 compileTemplate 一致。
    if (TemplateVarSchema.test(data.timeExpr)) return

    if (data.mode === TimerTriggerMode.Schedule) {
      if (!TimeExprRegex.test(data.timeExpr)) {
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
        message: '间隔模式下 timeExpr 必须是分钟数，或使用变量引用',
        path: ['timeExpr'],
      })
    }
  })

export type TimerData = z.infer<typeof TimerDataSchema>
