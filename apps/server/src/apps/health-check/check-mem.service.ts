import { Injectable } from '@nestjs/common'
import v8 from 'node:v8'
import { RingBuffer } from 'ring-buffer-ts'

export type MemoryMetric = {
  timestamp: number
  process: NodeJS.MemoryUsage
  v8: v8.HeapInfo
}

@Injectable()
export class CheckMemService {
  private readonly maxStorageSize = 100
  private metrics: RingBuffer<MemoryMetric> = new RingBuffer<MemoryMetric>(this.maxStorageSize)

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
}
