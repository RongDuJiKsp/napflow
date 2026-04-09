import { Injectable } from '@nestjs/common'
import type { NodeGCPerformanceDetail } from 'node:perf_hooks'
import { constants } from 'node:perf_hooks'
import { PerformanceObserver } from 'node:perf_hooks'
import { RingBuffer } from 'ring-buffer-ts'
import * as ss from 'simple-statistics'
import type {
  GCMetric,
  GCSnapshot,
  GCStatistics,
} from '@shared/common/health-check/gc'

@Injectable()
export class CheckGcService {
  private readonly maxStorageSize = 200
  private metrics: RingBuffer<GCMetric> = new RingBuffer<GCMetric>(
    this.maxStorageSize,
  )

  private observer: PerformanceObserver

  initializeGCObserver(): void {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'gc') {
          const measureEntry = entry as PerformanceMeasure
          const detail = measureEntry.detail as NodeGCPerformanceDetail
          const gcMetric: GCMetric = {
            timestamp: Date.now() / 1000,
            type: this.getGCTypeName(detail.kind || 0),
            duration: entry.duration,
            flags: detail?.flags || 0,
          }

          // 存储到内部数组
          this.metrics.add(gcMetric)
        }
      })
    })

    this.observer.observe({ entryTypes: ['gc'] })
  }

  private getGCTypeName(type: number): string {
    const gcTypes: Record<number, string> = {
      [constants.NODE_PERFORMANCE_GC_MAJOR]: 'Major GC',
      [constants.NODE_PERFORMANCE_GC_MINOR]: 'Minor GC',
      [constants.NODE_PERFORMANCE_GC_INCREMENTAL]: 'Incremental GC',
      [constants.NODE_PERFORMANCE_GC_WEAKCB]: 'Weak Callback GC',
    }
    return gcTypes[type] || `Unknown(${type})`
  }

  /**
   * 收集GC快照（指定时间窗口内的数据）
   */
  collectSnapshot(timeWindowMs: number): GCSnapshot {
    const now = Date.now() / 1000
    const windowStart = now - timeWindowMs / 1000

    // 获取时间窗口内的GC事件
    const recentGCs = this.metrics
      .toArray()
      .filter(gc => gc.timestamp >= windowStart)

    // 计算GC压力
    const pressureScore = this.calculateGCPressureScore(
      recentGCs,
      timeWindowMs,
    )

    return {
      recentGCs,
      frequency: recentGCs.length,
      pressureScore,
    }
  }

  private calculateGCPressureScore(
    gcEvents: GCMetric[],
    timeWindowMs: number,
  ): number {
    if (gcEvents.length === 0) return 100

    const totalDuration = gcEvents.reduce((sum, gc) => sum + gc.duration, 0)
    const gcTimeRatio = totalDuration / timeWindowMs
    const frequency = gcEvents.length

    let score = 100

    // 基于GC时间占比评分
    if (gcTimeRatio > 0.1)
      score -= 40 // 10%以上时间在GC
    else if (gcTimeRatio > 0.05)
      score -= 20 // 5%以上时间在GC
    else if (gcTimeRatio > 0.02) score -= 10 // 2%以上时间在GC

    // 基于GC频率评分
    if (frequency > 20) score -= 30
    else if (frequency > 10) score -= 15
    else if (frequency > 5) score -= 5

    // 基于单次GC持续时间评分
    const avgDuration = totalDuration / frequency
    if (avgDuration > 100)
      score -= 20 // 平均超过100ms
    else if (avgDuration > 50) score -= 10 // 平均超过50ms

    score = Math.max(0, score)

    return score
  }

  /**
   * 获取存储的指标数据
   */
  getMetrics(): GCMetric[] {
    return this.metrics.toArray()
  }

  /**
   * 获取最近N条记录
   */
  getRecentMetrics(count: number): GCMetric[] {
    return this.metrics.toArray().slice(-count)
  }

  /**
   * 清空存储的数据
   */
  clearMetrics(): void {
    this.metrics.clear()
  }

  /**
   * 销毁观察器
   */
  destroy(): void {
    if (this.observer) this.observer.disconnect()
  }

  /**
   * 计算GC统计数据（基于最近的GC事件）
   */
  calculateStatistics(timeWindow: number = 60 * 1e3): GCStatistics {
    const gcSnapshot = this.collectSnapshot(timeWindow)

    if (gcSnapshot.recentGCs.length === 0) {
      return {
        frequency: 0,
        duration: null,
        typeFrequency: {},
        pressureScore: gcSnapshot.pressureScore,
      }
    }

    const durations = gcSnapshot.recentGCs.map(gc => gc.duration)
    const typeFrequency: Record<string, number> = {}

    gcSnapshot.recentGCs.forEach((gc) => {
      typeFrequency[gc.type] = (typeFrequency[gc.type] || 0) + 1
    })

    return {
      frequency: gcSnapshot.recentGCs.length,
      duration:
        durations.length > 0
          ? {
            min: ss.min(durations),
            max: ss.max(durations),
            mean: ss.mean(durations),
            median: ss.median(durations),
            p95: ss.quantile(durations, 0.95),
          }
          : null,
      typeFrequency,
      pressureScore: gcSnapshot.pressureScore,
    }
  }
}
