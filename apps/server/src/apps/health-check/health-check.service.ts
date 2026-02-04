import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import * as ss from 'simple-statistics'
import type { CheckMemService } from './check-mem.service'
import type { MemoryMetric } from './check-mem.service'
import type { CheckCpuService } from './check-cpu.service'
import type { CPUMetric } from './check-cpu.service'
import type { CheckEventLoopService } from './check-event-loop.service'
import type { EventLoopMetric } from './check-event-loop.service'
import type { CheckGcService } from './check-gc.service'
import type { GCMetric } from './check-gc.service'
import { RingBuffer } from 'ring-buffer-ts'

// 聚合统计类型定义
export type StatisticalSummary = {
  min: number
  max: number
  mean: number
  median: number
  p95: number
}

export type AggregatedMetrics = {
  timestamp: number
  memory: {
    heapUsed: StatisticalSummary
    rss: StatisticalSummary
    heapTotal: StatisticalSummary
    utilization: {
      mean: number
      max: number
    }
  } | null
  cpu: {
    user: StatisticalSummary
    system: StatisticalSummary
    total: StatisticalSummary
  } | null
  eventLoop: {
    mean: StatisticalSummary
    max: StatisticalSummary
    healthScore: number
  } | null
  gc: {
    frequency: number
    duration: StatisticalSummary | null
    typeFrequency: Record<string, number>
    pressureScore: number
  } | null
}

export type RealTimeSamplesResponse = {
  memory: MemoryMetric[]
  cpu: CPUMetric[]
  eventLoop: EventLoopMetric[]
  gc: GCMetric[]
  timestamp: number
  note: string
}

export type AggregatedMetricsResponse = {
  data: AggregatedMetrics[]
  latest: AggregatedMetrics | null
  count: number
}

export type HealthSummary = {
  status: 'healthy' | 'warning' | 'critical'
  score: number
  timestamp: number
  details: {
    memory?: {
      heapUtilization: string
    }
    cpu?: {
      avgLoad: string
      maxLoad: string
    }
    eventLoop?: {
      health: string
      avgDelay: string
    }
    gc?: {
      pressureScore: number
      frequency: number
      avgDuration: string
    }
  }
}

@Injectable()
export class HealthCheckService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HealthCheckService.name)

  // 监控配置
  private readonly collectInterval = 10000 // 10秒采样一次
  private readonly outputInterval = 60000 // 1分钟输出一次
  private readonly windowSize = 6 // 6个样本的窗口(1分钟)

  // 聚合统计数据
  private aggregatedMetrics: RingBuffer<AggregatedMetrics> = new RingBuffer<AggregatedMetrics>(100)

  get aggregatedMetricsArray(): AggregatedMetrics[] {
    return this.aggregatedMetrics.toArray()
  }

  // 监控器实例
  private collectInterval_: NodeJS.Timeout | null = null
  private aggregationInterval: NodeJS.Timeout | null = null

  constructor(
    private readonly checkMemService: CheckMemService,
    private readonly checkCpuService: CheckCpuService,
    private readonly checkEventLoopService: CheckEventLoopService,
    private readonly checkGcService: CheckGcService,
  ) {}

  async onModuleInit() {
    this.logger.log('初始化 Node.js 运行时性能监控服务...')
    this.initializeMonitoring()
    this.logger.log('性能监控服务已启动 - 采样间隔: 10s, 统计输出: 1min')
  }

  async onModuleDestroy() {
    this.logger.log('正在关闭性能监控服务...')
    this.cleanup()
  }

  private initializeMonitoring(): void {
    this.startDataCollection()
    this.startStatisticalAggregation()
  }

  private startDataCollection(): void {
    // 初始化CPU监控基准
    this.checkCpuService.reset()

    this.collectInterval_ = setInterval(() => {
      this.collectAllMetrics()
    }, this.collectInterval)

    this.checkGcService.initializeGCObserver()
  }

  private collectAllMetrics(): void {
    // 触发各个小服务收集数据（数据存储在小服务内部）
    this.checkMemService.collectSnapshot()
    this.checkCpuService.collectSnapshot()
    this.checkEventLoopService.collectSnapshot()
    // GC数据通过观察器自动收集，无需手动触发
  }

  private startStatisticalAggregation(): void {
    // 每分钟进行一次统计聚合
    this.aggregationInterval = setInterval(() => {
      this.performStatisticalAggregation()
    }, this.outputInterval)
  }

  private performStatisticalAggregation(): void {
    const now = Date.now()

    const aggregated: AggregatedMetrics = {
      timestamp: now,
      memory: null,
      cpu: null,
      eventLoop: null,
      gc: null,
    }

    // 从小服务获取最近的数据进行统计聚合
    const recentMemory = this.checkMemService.getRecentMetrics(this.windowSize)
    const recentCpu = this.checkCpuService.getRecentMetrics(this.windowSize)
    const recentEventLoop = this.checkEventLoopService.getRecentMetrics(this.windowSize)
    const gcSnapshot = this.checkGcService.collectSnapshot(this.outputInterval)

    // 内存统计聚合
    if (recentMemory.length > 0)
      aggregated.memory = this.calculateMemoryStatistics(recentMemory)

    // CPU统计聚合
    if (recentCpu.length > 0)
      aggregated.cpu = this.calculateCpuStatistics(recentCpu)

    // 事件循环统计聚合
    if (recentEventLoop.length > 0)
      aggregated.eventLoop = this.calculateEventLoopStatistics(recentEventLoop)

    // GC统计聚合
    if (gcSnapshot.recentGCs.length > 0)
      aggregated.gc = this.calculateGCStatistics(gcSnapshot.recentGCs, gcSnapshot.pressureScore)

    this.aggregatedMetrics.add(aggregated)

    this.logger.debug(`统计聚合完成 - 时间戳: ${new Date(now).toISOString()}`)
  }

  private calculateMemoryStatistics(memoryData: MemoryMetric[]) {
    const heapUsedValues = memoryData.map(m => m.process.heapUsed)
    const rssValues = memoryData.map(m => m.process.rss)
    const heapTotalValues = memoryData.map(m => m.process.heapTotal)

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
        mean: ss.mean(heapUsedValues.map((used, i) =>
          (used / heapTotalValues[i]) * 100,
        )),
        max: ss.max(heapUsedValues.map((used, i) =>
          (used / heapTotalValues[i]) * 100,
        )),
      },
    }
  }

  private calculateCpuStatistics(cpuData: CPUMetric[]) {
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

  private calculateEventLoopStatistics(eventLoopData: EventLoopMetric[]) {
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
      healthScore: this.checkEventLoopService.calculateHealthScore(eventLoopData[eventLoopData.length - 1]),
    }
  }

  private calculateGCStatistics(gcData: GCMetric[], pressureScore: number) {
    const durations = gcData.map(gc => gc.duration)
    const typeFrequency: Record<string, number> = {}

    gcData.forEach((gc) => {
      typeFrequency[gc.type] = (typeFrequency[gc.type] || 0) + 1
    })

    return {
      frequency: gcData.length,
      duration: durations.length > 0 ? {
        min: ss.min(durations),
        max: ss.max(durations),
        mean: ss.mean(durations),
        median: ss.median(durations),
        p95: ss.quantile(durations, 0.95),

      } : null,
      typeFrequency,
      pressureScore,
    }
  }

  // 公共API方法

  /**
   * 获取实时采样数据（最近6次采样，约1分钟内）
   */
  public getRealTimeSamples(): RealTimeSamplesResponse {
    const gcSnapshot = this.checkGcService.collectSnapshot(60000)

    return {
      memory: this.checkMemService.getRecentMetrics(6),
      cpu: this.checkCpuService.getRecentMetrics(6),
      eventLoop: this.checkEventLoopService.getRecentMetrics(6),
      gc: gcSnapshot.recentGCs,
      timestamp: Date.now(),
      note: '最近6次采样数据（1分钟内）',
    }
  }

  /**
   * 获取统计聚合数据（1分钟间隔的统计结果）
   */
  public getAggregatedMetrics(): AggregatedMetricsResponse {
    return {
      data: this.aggregatedMetricsArray.slice(-20), // 最近20条记录
      latest: this.aggregatedMetricsArray.slice(-1)[0] || null,
      count: this.aggregatedMetricsArray.length,
    }
  }

  /**
   * 获取健康状况摘要
   */
  public getHealthSummary(): HealthSummary {
    const healthScore = this.calculateOverallHealthScore()
    const latest = this.aggregatedMetricsArray.slice(-1)[0]

    return {
      status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical',
      score: healthScore,
      timestamp: Date.now(),
      details: {
        memory: latest?.memory ? {
          heapUtilization: `${latest.memory.utilization.mean.toFixed(2)}%`,
        } : undefined,
        cpu: latest?.cpu ? {
          avgLoad: `${latest.cpu.total.mean.toFixed(2)}%`,
          maxLoad: `${latest.cpu.total.max.toFixed(2)}%`,
        } : undefined,
        eventLoop: latest?.eventLoop ? {
          health: latest.eventLoop.healthScore > 80 ? 'excellent'
            : latest.eventLoop.healthScore > 60 ? 'good' : 'poor',
          avgDelay: `${(latest.eventLoop.mean.mean / 1000000).toFixed(2)}ms`,
        } : undefined,
        gc: latest?.gc ? {
          pressureScore: latest.gc.pressureScore,
          frequency: latest.gc.frequency,
          avgDuration: latest.gc.duration ? `${latest.gc.duration.mean.toFixed(2)}ms` : '0ms',
        } : undefined,
      },
    }
  }

  /**
   * 计算整体健康评分
   */
  private calculateOverallHealthScore(): number {
    let score = 100

    // 从小服务获取最近的指标计算健康分数
    const recentMemory = this.checkMemService.getRecentMetrics(5)
    const recentEventLoop = this.checkEventLoopService.getRecentMetrics(5)
    const gcSnapshot = this.checkGcService.collectSnapshot(60000)

    // 内存健康检查
    if (recentMemory.length > 0) {
      const avgHeapUsage = recentMemory.reduce((sum, m) =>
        sum + (m.process.heapUsed / m.process.heapTotal), 0,
      ) / recentMemory.length

      if (avgHeapUsage > 0.9) score -= 30
      else if (avgHeapUsage > 0.8) score -= 15
    }

    // 事件循环健康检查
    if (recentEventLoop.length > 0) {
      const avgDelay = recentEventLoop.reduce((sum, e) => sum + e.mean, 0) / recentEventLoop.length

      if (avgDelay > 50000000) score -= 25 // 50ms
      else if (avgDelay > 20000000) score -= 10 // 20ms
    }

    // GC健康检查
    if (gcSnapshot.frequency > 10)
      score -= 15

    return Math.max(0, score)
  }

  private cleanup(): void {
    if (this.collectInterval_)
      clearInterval(this.collectInterval_)

    if (this.aggregationInterval)
      clearInterval(this.aggregationInterval)

    // 清理小服务资源
    this.checkEventLoopService.destroy()
    this.checkGcService.destroy()

    this.logger.log('性能监控服务已关闭')
  }
}
