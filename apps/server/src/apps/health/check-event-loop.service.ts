import { Injectable } from '@nestjs/common'
import { monitorEventLoopDelay } from 'node:perf_hooks'
import { RingBuffer } from 'ring-buffer-ts'
import * as ss from 'simple-statistics'
import type {
  EventLoopMetric,
  EventLoopStatistics,
} from '@shared/common/health-check/event-loop'

@Injectable()
export class CheckEventLoopService {
  private readonly maxStorageSize = 100
  private metrics: RingBuffer<EventLoopMetric>
    = new RingBuffer<EventLoopMetric>(this.maxStorageSize)

  private histogram = monitorEventLoopDelay({ resolution: 5 }) // 事件循环监控精度

  collectSnapshot(): EventLoopMetric {
    const metric: EventLoopMetric = {
      timestamp: Math.floor(Date.now() / 1e3),
      min: Math.floor(this.histogram.min / 1e6),
      max: Math.floor(this.histogram.max / 1e6),
      mean: Math.floor(this.histogram.mean / 1e6),
      p50: Math.floor(this.histogram.percentile(50) / 1e6),
      p90: Math.floor(this.histogram.percentile(90) / 1e6),
      p99: Math.floor(this.histogram.percentile(99) / 1e6),
      p999: Math.floor(this.histogram.percentile(99.9) / 1e6),
    }

    this.metrics.add(metric)

    // 重置直方图以准备下次采样
    this.histogram.reset()

    return metric
  }

  getMetrics(): EventLoopMetric[] {
    return this.metrics.toArray()
  }

  getRecentMetrics(count: number): EventLoopMetric[] {
    return this.metrics.toArray().slice(-count)
  }

  /**
   * 计算事件循环健康评分
   */
  calculateHealthScore(metric: EventLoopMetric): number {
    let score = 100

    // 基于平均延迟评分
    if (metric.mean > 50 * 1e6)
      score -= 40 // 50ms
    else if (metric.mean > 20 * 1e6)
      score -= 20 // 20ms
    else if (metric.mean > 10 * 1e6) score -= 10 // 10ms

    // 基于P99延迟评分
    if (metric.p99 > 100 * 1e6)
      score -= 30 // 100ms
    else if (metric.p99 > 50 * 1e6) score -= 15 // 50ms

    // 基于最大延迟评分
    if (metric.max > 200 * 1e6)
      score -= 20 // 200ms
    else if (metric.max > 100 * 1e6) score -= 10 // 100ms

    return Math.max(0, score)
  }

  clearMetrics(): void {
    this.metrics.clear()
  }

  initEventLoopSnapshot(): void {
    this.histogram.enable()
  }

  destroy(): void {
    this.histogram.disable()
  }

  calculateStatistics(windowSize: number = 6): EventLoopStatistics | null {
    const eventLoopData = this.getRecentMetrics(windowSize)

    if (eventLoopData.length === 0) return null

    const meanValues = eventLoopData.map(e => e.mean)
    const maxValues = eventLoopData.map(e => e.max)

    return {
      mean: {
        min: ss.min(meanValues),
        max: ss.max(meanValues),
        mean: ss.mean(meanValues),
        median: ss.median(meanValues),
        p95: ss.quantile(meanValues, 0.95),
      },
      max: {
        min: ss.min(maxValues),
        max: ss.max(maxValues),
        mean: ss.mean(maxValues),
        median: ss.median(maxValues),
        p95: ss.quantile(maxValues, 0.95),
      },
      healthScore: this.calculateHealthScore(
        eventLoopData[eventLoopData.length - 1],
      ),
    }
  }
}
