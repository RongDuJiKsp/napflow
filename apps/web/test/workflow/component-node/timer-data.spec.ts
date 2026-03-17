import {
  TimerDataSchema,
  TimerTriggerMode,
} from '@shared/common/workflow/node-data/timer'
import { describe, expect, test } from 'vitest'

describe('TimerDataSchema', () => {
  test('定时模式：允许 HH:mm 字符串', () => {
    const parsed = TimerDataSchema.parse({
      mode: TimerTriggerMode.Schedule,
      timeExpr: '23:59',
    })

    expect(parsed.timeExpr).toBe('23:59')
  })

  test('定时模式：默认模式下仍按 HH:mm 校验', () => {
    expect(() => {
      TimerDataSchema.parse({
        timeExpr: '10',
      })
    }).toThrow()
  })

  test('间隔模式：分钟数字字符串保持为 string，运行时再解析', () => {
    const parsed = TimerDataSchema.parse({
      mode: TimerTriggerMode.Interval,
      timeExpr: '2',
    })

    expect(parsed.timeExpr).toBe('2')
    expect(typeof parsed.timeExpr).toBe('string')
  })

  test('间隔模式：变量引用字符串保持原样', () => {
    const parsed = TimerDataSchema.parse({
      mode: TimerTriggerMode.Interval,
      timeExpr: '$vars.intervalMinutes',
    })

    expect(parsed.timeExpr).toBe('$vars.intervalMinutes')
  })

  test('间隔模式：不可转数字且非变量引用时报错', () => {
    expect(() => {
      TimerDataSchema.parse({
        mode: TimerTriggerMode.Interval,
        timeExpr: 'abc',
      })
    }).toThrow()
  })
})
