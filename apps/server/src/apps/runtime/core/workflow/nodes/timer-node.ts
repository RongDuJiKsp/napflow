import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/core/component-node'
import {
  TimerDataSchema,
  TimerTriggerMode,
} from '@shared/common/workflow/node-data/timer'
import type z from 'zod'
import type { CommNodeType, CommTrigger } from '../node'
import { TriggerOnEvents } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WillTask } from '@/src/utils/task-pool'
import type { WorkflowThread } from '../pool'
import { Logger } from '@nestjs/common'
export const TimerDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  TimerDataSchema.shape,
)
export type TimerDataCtx = z.infer<typeof TimerDataCtxSchema>
export class TimerNode extends CommNode<TimerDataCtx> implements CommTrigger {
  readonly role = CommNodeRole.Trigger
  readonly triggerEv: TriggerOnEvents = TriggerOnEvents.Timer
  private readonly logger = new Logger(TimerNode.name)

  constructor(data: CommNodeType<TimerDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    // 定时器触发时，kv 里会有 time、mountAt、uptime 三个字段：
    // - time: Unix epoch 秒字符串（当前触发时间）
    // - mountAt: 适配器注入的挂载时间标记（当前实现不保证是 Unix epoch，只是随 seq 变化的值）
    // - uptime: 自挂载以来经过的秒数（elapsed seconds，而非 Unix epoch）
    const uptimeTs = Number(thread.kv.uptime)
    const mountAtTs = Number(thread.kv.mountAt)
    const timeTs = Number(thread.kv.time)
    this.logger.debug(
      `TimerNode triggered with time: ${timeTs}, mountAt: ${mountAtTs}, uptime: ${uptimeTs}`,
    )
    if (
      Number.isNaN(uptimeTs)
      || Number.isNaN(mountAtTs)
      || Number.isNaN(timeTs)
    ) {
      this.logger.warn(
        'TimerNode received invalid time data, skipping trigger.',
      )
      nextTask.abort()
      return
    }
    // 判断是否该往下走
    const timeExpr = thread.compileEnvTemplate(this.data.timeExpr)
    if (this.data.mode === TimerTriggerMode.Schedule) {
      // 如果是定时触发，用当前时间和表达式算是否触发
      const [hour, minus] = timeExpr.split(':').map(part => Number(part))
      const currDate = new Date(timeTs * 1000)
      if (!(currDate.getHours() === hour && currDate.getMinutes() === minus))
        nextTask.abort()
    }
    else if (this.data.mode === TimerTriggerMode.Interval) {
      // 如果是间隔触发，timeExpr 按分钟解释，先把 uptime 换算成分钟再取模
      const intervalMinutes = Number(timeExpr)
      const uptimeMinutes = Math.floor(uptimeTs / 60)
      if (intervalMinutes <= 0 || uptimeMinutes % intervalMinutes !== 0)
        nextTask.abort()
    }
  }
}
