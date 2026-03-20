import type { PluginService } from './traits'

/**
 * @description 向js任务池提交任务，但是可以在被运行前取消（被调度了就不行了）
 */
export class Task<Fn extends () => void> {
  private constructor(private readonly task: Fn) {}
  private abortSignal = 0 // 0: 未取消，1: 取消
  private cancelable = true // true: 未被运行过，false: 被运行过
  private run() {
    if (this.abortSignal || !this.cancelable) return
    this.cancelable = false
    this.task()
  }

  static submit<F extends () => void>(fn: F, delay?: number): Task<F> {
    const task = new Task(fn)
    setTimeout(() => {
      task.run()
    }, delay)
    return task
  }

  static will<F extends () => void>(fn: F): WillTask<F> {
    const task = new WillTask(fn)
    return task
  }

  abort() {
    this.abortSignal = 1
    return this.cancelable
  }
}

/**
 * @description 可取消提交的任务
 */
export class WillTask<Fn extends () => void = () => void> {
  constructor(private readonly task: Fn) {}
  private cancelSignal = 0 // 0: 未取消，1: 取消

  abort() {
    this.cancelSignal = 1
  }

  submit(delay?: number) {
    if (this.cancelSignal) return
    return Task.submit(this.task, delay)
  }

  orSubmit(saveFn: (task: Task<Fn>) => void, delay?: number) {
    if (this.cancelSignal) return
    const task = Task.submit(this.task, delay)
    saveFn(task)
  }
}

export type SeqPoller = (seq: number) => void
export class MinusTimePoller implements PluginService<[]> {
  private callables: SeqPoller[] = []
  private intervalTask: ReturnType<typeof setInterval> | null = null
  private mountedAt: Date | null = null
  private dispatchedMinutes = 0

  get safeMountAt() {
    if (this.mountedAt === null)
      throw new Error('MinusTimePoller is not mounted')
    return this.mountedAt
  }

  register(fn: SeqPoller) {
    this.callables.push(fn)
  }

  private trigger(seq: number) {
    this.callables.forEach(fn => fn(seq))
  }

  removeAll() {
    this.callables = []
  }

  private flushByNow() {
    if (this.mountedAt === null) return

    const elapsedMinutes = Math.floor(
      (Date.now() - this.mountedAt.valueOf()) / 60_000,
    )
    while (this.dispatchedMinutes < elapsedMinutes) {
      this.dispatchedMinutes += 1
      this.trigger(this.dispatchedMinutes)
    }
  }

  get mountAtTs() {
    return Math.floor(this.safeMountAt.valueOf() / 1000)
  }

  get uptimeTs() {
    return Math.floor((Date.now() - this.safeMountAt.valueOf()) / 1000)
  }

  /**
   * @description 将序列号换算为一个虚拟的时间戳
   * @param seq 序列号 (可以理解为距离挂载的分钟数)，通常由MinusTimePoller自动递增传入
   * @returns  一个时间戳，表示这个虚拟的序列号所对应的虚拟的现实时间戳
   */
  realTime(seq: number) {
    return Math.floor((this.safeMountAt.valueOf() + seq * 60_000) / 60_000)
  }

  /**
   * @description 获取自从挂载以来经过了多少个整分钟
   * @param seq 序列号 (可以理解为距离挂载的分钟数)，通常由MinusTimePoller自动递增传入
   * @returns  自从挂载以来经过了多少个整分钟
   */
  realMountTime(seq: number) {
    return seq
  }

  mount(): void {
    if (this.intervalTask) return

    this.mountedAt = new Date()
    this.dispatchedMinutes = 0
    this.intervalTask = setInterval(() => {
      this.flushByNow()
    }, 1000)
  }

  unmount(): void {
    if (!this.intervalTask) return

    clearInterval(this.intervalTask)
    this.intervalTask = null
    this.mountedAt = null
    this.dispatchedMinutes = 0
    this.removeAll()
  }
}
