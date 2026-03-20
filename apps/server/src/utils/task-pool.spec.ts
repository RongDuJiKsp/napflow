import { afterEach, describe, expect, it, vi } from 'vitest'

import { MinusTimePoller } from './task-pool'

afterEach(() => {
  vi.useRealTimers()
})

describe('MinusTimePoller', () => {
  it('从 mount 开始按已过去分钟数严格触发，且 seq 唯一递增', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T00:00:00.000Z'))

    const poller = new MinusTimePoller()
    const received: number[] = []
    poller.register((seq) => {
      received.push(seq)
    })

    poller.mount()

    expect(received).toEqual([])

    vi.advanceTimersByTime(5 * 60 * 1000 + 200)

    expect(received).toEqual([1, 2, 3, 4, 5])
  })

  it('在单次 tick 内补齐漏掉的分钟触发，且 seq 保持唯一', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T00:00:00.000Z'))

    const poller = new MinusTimePoller()
    const received: number[] = []
    poller.register((seq) => {
      received.push(seq)
    })

    poller.mount()

    vi.setSystemTime(new Date('2026-03-16T00:03:00.000Z'))
    vi.advanceTimersByTime(1000)

    expect(received).toEqual([1, 2, 3])
  })

  it('unmount 后停止触发', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T00:00:00.000Z'))

    const poller = new MinusTimePoller()
    const received: number[] = []
    poller.register((seq) => {
      received.push(seq)
    })

    poller.mount()
    vi.advanceTimersByTime(2 * 60 * 1000 + 200)
    poller.unmount()
    vi.advanceTimersByTime(10 * 60 * 1000)

    expect(received).toEqual([1, 2])
  })

  it('realTime 可从 seq 推导对应的 Unix 分钟数', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T00:00:30.000Z'))

    const poller = new MinusTimePoller()
    poller.mount()

    expect(poller.realTime(1)).toBe(
      Math.floor(new Date('2026-03-16T00:01:30.000Z').getTime() / 60_000),
    )
    expect(poller.realTime(3)).toBe(
      Math.floor(new Date('2026-03-16T00:03:30.000Z').getTime() / 60_000),
    )
  })

  it('未 mount 时调用 realTime 会抛错', () => {
    const poller = new MinusTimePoller()

    expect(() => poller.realTime(1)).toThrow('MinusTimePoller is not mounted')
  })
})
