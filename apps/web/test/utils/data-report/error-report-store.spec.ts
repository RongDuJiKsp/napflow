import { InternErrorSource } from '@/utils/data-report/shared/error-report-contract'
import { createInternErrorStore } from '@/utils/data-report/server/error-report-store'
import { describe, expect, test } from 'vitest'

const createPayload = (
  message: string,
  source: InternErrorSource = InternErrorSource.WindowError,
) => ({
  source,
  message,
  stack: 'Error: mock stack',
  url: 'http://localhost:3000/mock',
  userAgent: 'vitest-agent',
})

describe('intern error report store', () => {
  test('按时间窗口清理过期数据', () => {
    const windowMs = 30 * 60 * 1000
    const store = createInternErrorStore({
      windowMs,
      dedupeWindowMs: 10 * 1000,
    })

    const nowMs = 2_000_000_000
    store.addReport(createPayload('old-error'), nowMs - windowMs - 1000)
    store.addReport(createPayload('new-error'), nowMs - 60_000)

    const snapshot = store.getSnapshot(nowMs)

    expect(snapshot.total).toBe(1)
    expect(snapshot.items).toHaveLength(1)
    expect(snapshot.items[0].message).toBe('new-error')
  })

  test('短时间重复异常会被去重并累计次数', () => {
    const dedupeWindowMs = 10 * 1000
    const store = createInternErrorStore({
      windowMs: 30 * 60 * 1000,
      dedupeWindowMs,
    })

    const baseMs = 3_000_000_000
    const first = store.addReport(createPayload('same-error'), baseMs)
    const second = store.addReport(createPayload('same-error'), baseMs + 3000)

    expect(first.deduped).toBe(false)
    expect(second.deduped).toBe(true)

    const inWindowSnapshot = store.getSnapshot(baseMs + 3000)
    expect(inWindowSnapshot.items).toHaveLength(1)
    expect(inWindowSnapshot.items[0].duplicateCount).toBe(2)
    expect(inWindowSnapshot.total).toBe(2)

    store.addReport(createPayload('same-error'), baseMs + dedupeWindowMs + 4000)
    const outOfWindowSnapshot = store.getSnapshot(baseMs + dedupeWindowMs + 4000)

    expect(outOfWindowSnapshot.items).toHaveLength(2)
    expect(outOfWindowSnapshot.total).toBe(3)
  })

  test('按来源聚合并输出分钟趋势', () => {
    const store = createInternErrorStore({
      windowMs: 30 * 60 * 1000,
      dedupeWindowMs: 10 * 1000,
    })

    const baseMs = 4_000_000_000

    store.addReport(createPayload('window-1', InternErrorSource.WindowError), baseMs)
    store.addReport(createPayload('window-2', InternErrorSource.WindowError), baseMs + 10_000)
    store.addReport(
      createPayload('rejection-1', InternErrorSource.UnhandledRejection),
      baseMs + 70_000,
    )

    const snapshot = store.getSnapshot(baseMs + 70_000)

    expect(snapshot.total).toBe(3)
    expect(snapshot.bySource[InternErrorSource.WindowError]).toBe(2)
    expect(snapshot.bySource[InternErrorSource.UnhandledRejection]).toBe(1)

    const firstMinute = Math.floor(baseMs / 60000) * 60000
    const secondMinute = firstMinute + 60000

    const firstTrend = snapshot.trend.find(point => point.minuteStartMs === firstMinute)
    const secondTrend = snapshot.trend.find(point => point.minuteStartMs === secondMinute)

    expect(firstTrend?.count).toBe(2)
    expect(secondTrend?.count).toBe(1)
  })

  test('时间字段语义区分：发生时间、首次接收时间、最近命中时间', () => {
    const store = createInternErrorStore({
      windowMs: 30 * 60 * 1000,
      dedupeWindowMs: 10 * 1000,
    })

    const firstNowMs = 5_000_000_000
    const secondNowMs = firstNowMs + 3000
    const happenedAtMs = firstNowMs - 2000

    store.addReport({
      ...createPayload('time-semantics-error'),
      at: happenedAtMs,
    }, firstNowMs)

    store.addReport({
      ...createPayload('time-semantics-error'),
      at: happenedAtMs + 1000,
    }, secondNowMs)

    const snapshot = store.getSnapshot(secondNowMs)
    expect(snapshot.items).toHaveLength(1)

    const [item] = snapshot.items
    expect(item.happenedAtMs).toBe(happenedAtMs)
    expect(item.receivedAtMs).toBe(firstNowMs)
    expect(item.lastSeenAtMs).toBe(secondNowMs)
  })
})
