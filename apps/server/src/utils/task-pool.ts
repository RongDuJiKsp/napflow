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

  abort() {
    this.abortSignal = 1
    return this.cancelable
  }
}
