import { Injectable } from '@nestjs/common'
import { monitorEventLoopDelay } from 'node:perf_hooks'
import { RingBuffer } from 'ring-buffer-ts'

export type EventLoopMetric = {
  timestamp: number
  min: number
  max: number
  mean: number
  stddev: number
  p50: number
  p90: number
  p99: number
  p999: number
}

@Injectable()
export class CheckEventLoopService {
  private readonly maxStorageSize = 100
  private metrics: RingBuffer<EventLoopMetric> = new RingBuffer<EventLoopMetric>(this.maxStorageSize)
  private histogram = monitorEventLoopDelay({ resolution: 20 })

  collectSnapshot(): EventLoopMetric {
    const metric: EventLoopMetric = {
      timestamp: Date.now() / 1000,
      min: this.histogram.min,
      max: this.histogram.max,
      mean: this.histogram.mean,
      stddev: this.histogram.stddev,
      p50: this.histogram.percentile(50),
      p90: this.histogram.percentile(90),
      p99: this.histogram.percentile(99),
      p999: this.histogram.percentile(99.9),
    }

    this.metrics.add(metric)

    // 重置直方图以准备下次采样
    this.histogram.reset()

    return metric
  }

  /**
   * 获取存储的指标数据
   */
  getMetrics(): EventLoopMetric[] {
    return this.metrics.toArray()
  }

  /**
   * 获取最近N条记录
   */
  getRecentMetrics(count: number): EventLoopMetric[] {
    return this.metrics.toArray().slice(-count)
  }

  /**
   * 计算事件循环健康评分
   */
  calculateHealthScore(metric: EventLoopMetric): number {
    let score = 100

    // 基于平均延迟评分
    if (metric.mean > 50000000) score -= 40 // 50ms
    else if (metric.mean > 20000000) score -= 20 // 20ms
    else if (metric.mean > 10000000) score -= 10 // 10ms

    // 基于P99延迟评分
    if (metric.p99 > 100000000) score -= 30 // 100ms
    else if (metric.p99 > 50000000) score -= 15 // 50ms

    // 基于最大延迟评分
    if (metric.max > 200000000) score -= 20 // 200ms
    else if (metric.max > 100000000) score -= 10 // 100ms

    return Math.max(0, score)
  }

  /**
   * 清空存储的数据
   */
  clearMetrics(): void {
    this.metrics.clear()
  }

  initEventLoopSnapshot(): void {
    this.histogram.enable()
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.histogram.disable()
  }
}
