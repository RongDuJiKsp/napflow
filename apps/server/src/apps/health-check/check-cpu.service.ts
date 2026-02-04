import { Injectable } from '@nestjs/common'
import { RingBuffer } from 'ring-buffer-ts'
import * as ss from 'simple-statistics'
import type { StatisticalSummary } from './types'

export type CPUMetric = {
  timestamp: number
  userPercent: number
  systemPercent: number
  totalPercent: number
}

export type CPUStatistics = {
  user: StatisticalSummary
  system: StatisticalSummary
  total: StatisticalSummary
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

  /**
   * 计算CPU统计数据（基于最近的样本窗口）
   */
  calculateStatistics(windowSize: number = 6) {
    const cpuData = this.getRecentMetrics(windowSize)

    if (cpuData.length === 0)
      return null

    const userValues = cpuData.map(c => c.userPercent)
    const systemValues = cpuData.map(c => c.systemPercent)
    const totalValues = cpuData.map(c => c.totalPercent)

    return {
      user: {
        min: ss.min(userValues),
        max: ss.max(userValues),
        mean: ss.mean(userValues),
        median: ss.median(userValues),
        p95: ss.quantile(userValues, 0.95),
      },
      system: {
        min: ss.min(systemValues),
        max: ss.max(systemValues),
        mean: ss.mean(systemValues),
        median: ss.median(systemValues),
        p95: ss.quantile(systemValues, 0.95),
      },
      total: {
        min: ss.min(totalValues),
        max: ss.max(totalValues),
        mean: ss.mean(totalValues),
        median: ss.median(totalValues),
        p95: ss.quantile(totalValues, 0.95),
      },
    }
  }
}
