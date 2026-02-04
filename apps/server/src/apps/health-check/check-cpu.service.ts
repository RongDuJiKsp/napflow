import { Injectable } from '@nestjs/common'
import { RingBuffer } from 'ring-buffer-ts'

export type CPUMetric = {
  timestamp: number
  userPercent: number
  systemPercent: number
  totalPercent: number
}

@Injectable()
export class CheckCpuService {
  private readonly maxStorageSize = 100
  private metrics: RingBuffer<CPUMetric> = new RingBuffer<CPUMetric>(this.maxStorageSize)
  private lastCpuUsage: NodeJS.CpuUsage | null = null

  /**
   * 重置CPU监控基准
   */
  reset(): void {
    this.lastCpuUsage = process.cpuUsage()
  }

  collectSnapshot(): CPUMetric {
    const currentUsage = process.cpuUsage(this.lastCpuUsage || undefined)
    this.lastCpuUsage = process.cpuUsage()

    // 转换为百分比
    const totalTime = currentUsage.user + currentUsage.system
    const userPercent = totalTime > 0 ? (currentUsage.user / totalTime) * 100 : 0
    const systemPercent = totalTime > 0 ? (currentUsage.system / totalTime) * 100 : 0
    const totalPercent = userPercent + systemPercent

    const metric: CPUMetric = {
      timestamp: Date.now() / 1000,
      userPercent,
      systemPercent,
      totalPercent,
    }

    this.metrics.add(metric)

    return metric
  }

  getMetrics(): CPUMetric[] {
    return this.metrics.toArray()
  }

  getRecentMetrics(count: number): CPUMetric[] {
    return this.metrics.toArray().slice(-count)
  }

  clearMetrics(): void {
    this.metrics.clear()
  }
}
