import { Injectable } from '@nestjs/common'
import { RingBuffer } from 'ring-buffer-ts'
import * as ss from 'simple-statistics'
import type { CPUMetric, CPUStatistics } from '@shared/common/health-check/cpu'

@Injectable()
export class CheckCpuService {
  private readonly maxStorageSize = 100
  private metrics: RingBuffer<CPUMetric> = new RingBuffer<CPUMetric>(
    this.maxStorageSize,
  )

  private lastCpuUsage: NodeJS.CpuUsage | null = null
  private lastHrTime: [number, number] | null = null

  /**
   * 重置CPU监控基准
   */
  reset(): void {
    this.lastCpuUsage = process.cpuUsage()
    this.lastHrTime = process.hrtime()
  }

  collectSnapshot(): CPUMetric {
    const currentCpuUsage = process.cpuUsage(this.lastCpuUsage || undefined)
    const currentHrTime = process.hrtime(this.lastHrTime || undefined)

    // 计算实际经过的时间（微秒）
    // hrtime 返回 [秒, 纳秒]，转换为微秒
    const elapsedMicroseconds = currentHrTime[0] * 1e6 + currentHrTime[1] / 1e3

    // 更新基准
    this.lastCpuUsage = process.cpuUsage()
    this.lastHrTime = process.hrtime()

    // 计算真正的 CPU 使用率百分比
    // cpuUsage 返回的是微秒级的 CPU 时间
    // 单核最大100%，多核可能超过100%，这里保持原始值
    let userPercent = 0
    let systemPercent = 0

    if (elapsedMicroseconds > 0) {
      userPercent = (currentCpuUsage.user / elapsedMicroseconds) * 100
      systemPercent = (currentCpuUsage.system / elapsedMicroseconds) * 100
    }

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
  calculateStatistics(windowSize: number = 6): CPUStatistics | null {
    const cpuData = this.getRecentMetrics(windowSize)

    if (cpuData.length === 0) return null

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
