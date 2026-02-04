import { Injectable } from '@nestjs/common'
import { PerformanceObserver } from 'node:perf_hooks'
import { RingBuffer } from 'ring-buffer-ts'

export type GCMetric = {
  timestamp: number
  type: string
  duration: number
  flags: number
}

export type GCSnapshot = {
  recentGCs: GCMetric[]
  frequency: number
  pressureScore: number
}

@Injectable()
export class CheckGcService {
  private readonly maxStorageSize = 200
  private metrics: RingBuffer<GCMetric> = new RingBuffer<GCMetric>(this.maxStorageSize)
  private observer: PerformanceObserver

  initializeGCObserver(): void {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'gc') {
          const detail = (entry as any).detail
          const gcMetric: GCMetric = {
            timestamp: Date.now() / 1000,
            type: this.getGCTypeName(detail?.type || 0),
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
      1: 'Scavenge',
      2: 'Mark-Sweep',
      4: 'Incremental-Marking',
      8: 'Weak-Processing',
      15: 'All',
    }
    return gcTypes[type] || `Unknown(${type})`
  }

  /**
   * 收集GC快照（指定时间窗口内的数据）
   */
  collectSnapshot(timeWindowMs: number): GCSnapshot {
    const now = Date.now() / 1000
    const windowStart = now - (timeWindowMs / 1000)

    // 获取时间窗口内的GC事件
    const recentGCs = this.metrics.toArray().filter(gc => gc.timestamp >= windowStart)

    // 计算GC压力
    const pressureScore = this.calculateGCPressureScore(recentGCs, timeWindowMs)

    return {
      recentGCs,
      frequency: recentGCs.length,
      pressureScore,
    }
  }

  private calculateGCPressureScore(gcEvents: GCMetric[], timeWindowMs: number): number {
    if (gcEvents.length === 0)
      return 100

    const totalDuration = gcEvents.reduce((sum, gc) => sum + gc.duration, 0)
    const gcTimeRatio = totalDuration / timeWindowMs
    const frequency = gcEvents.length

    let score = 100

    // 基于GC时间占比评分
    if (gcTimeRatio > 0.1) score -= 40 // 10%以上时间在GC
    else if (gcTimeRatio > 0.05) score -= 20 // 5%以上时间在GC
    else if (gcTimeRatio > 0.02) score -= 10 // 2%以上时间在GC

    // 基于GC频率评分
    if (frequency > 20) score -= 30
    else if (frequency > 10) score -= 15
    else if (frequency > 5) score -= 5

    // 基于单次GC持续时间评分
    const avgDuration = totalDuration / frequency
    if (avgDuration > 100) score -= 20 // 平均超过100ms
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
    if (this.observer)
      this.observer.disconnect()
  }
}
