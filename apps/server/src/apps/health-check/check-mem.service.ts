import { Injectable } from '@nestjs/common'
import v8 from 'node:v8'
import { RingBuffer } from 'ring-buffer-ts'
import * as ss from 'simple-statistics'
import type {
  MemoryMetric,
  MemoryStatistics,
} from '@shared/common/health-check/mem'
@Injectable()
export class CheckMemService {
  private readonly maxStorageSize = 100
  private metrics: RingBuffer<MemoryMetric> = new RingBuffer<MemoryMetric>(
    this.maxStorageSize,
  )

  /**
   * 收集当前内存快照并存储
   */
  collectSnapshot(): MemoryMetric {
    const processMemory = process.memoryUsage()
    const v8Memory = v8.getHeapStatistics()

    const metric: MemoryMetric = {
      timestamp: Date.now() / 1000,
      process: processMemory,
      v8: v8Memory,
    }
    this.metrics.add(metric)
    return metric
  }

  /**
   * 获取存储的指标数据
   */
  getMetrics(): MemoryMetric[] {
    return this.metrics.toArray()
  }

  /**
   * 获取最近N条记录
   */
  getRecentMetrics(count: number): MemoryMetric[] {
    return this.metrics.toArray().slice(-count)
  }

  /**
   * 获取内存使用率
   */
  getMemoryUtilization(): number {
    const memory = process.memoryUsage()
    return (memory.heapUsed / memory.heapTotal) * 100
  }

  /**
   * 清空存储的数据
   */
  clearMetrics(): void {
    this.metrics.clear()
  }

  /**
   * 计算内存统计数据（基于最近的样本窗口）
   */
  calculateStatistics(windowSize: number = 6): MemoryStatistics | null {
    const memoryData = this.getRecentMetrics(windowSize)

    if (memoryData.length === 0) return null

    const heapUsedValues = memoryData.map(m => m.process.heapUsed)
    const rssValues = memoryData.map(m => m.process.rss)
    const heapTotalValues = memoryData.map(m => m.process.heapTotal)

    const utilizationValues = heapUsedValues.map(
      (used, i) => (used / heapTotalValues[i]) * 100,
    )

    return {
      heapUsed: {
        min: ss.min(heapUsedValues),
        max: ss.max(heapUsedValues),
        mean: ss.mean(heapUsedValues),
        median: ss.median(heapUsedValues),
        p95: ss.quantile(heapUsedValues, 0.95),
      },
      rss: {
        min: ss.min(rssValues),
        max: ss.max(rssValues),
        mean: ss.mean(rssValues),
        median: ss.median(rssValues),
        p95: ss.quantile(rssValues, 0.95),
      },
      heapTotal: {
        min: ss.min(heapTotalValues),
        max: ss.max(heapTotalValues),
        mean: ss.mean(heapTotalValues),
        median: ss.median(heapTotalValues),
        p95: ss.quantile(heapTotalValues, 0.95),
      },
      utilization: {
        min: ss.min(utilizationValues),
        mean: ss.mean(utilizationValues),
        max: ss.max(utilizationValues),
        median: ss.median(utilizationValues),
        p95: ss.quantile(utilizationValues, 0.95),
      },
    }
  }
}
