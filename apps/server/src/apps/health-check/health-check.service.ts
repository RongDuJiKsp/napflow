import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { CheckMemService } from './check-mem.service'
import type { } from './check-mem.service'
import { CheckCpuService } from './check-cpu.service'
import { CheckEventLoopService } from './check-event-loop.service'
import { CheckGcService } from './check-gc.service'
import { RingBuffer } from 'ring-buffer-ts'
import type { AggregatedMetrics, HealthSummary, RealTimeSamples } from '@shared/common/health-check/health-check'

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
  private aggregationInterval_: NodeJS.Timeout | null = null

  constructor(
    @Inject(CheckMemService) private readonly checkMemService: CheckMemService,
    @Inject(CheckCpuService) private readonly checkCpuService: CheckCpuService,
    @Inject(CheckEventLoopService) private readonly checkEventLoopService: CheckEventLoopService,
    @Inject(CheckGcService) private readonly checkGcService: CheckGcService,
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
    this.checkEventLoopService.initEventLoopSnapshot()
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
    this.aggregationInterval_ = setInterval(() => {
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

    // 内存统计聚合
    aggregated.memory = this.checkMemService.calculateStatistics(this.windowSize)

    // CPU统计聚合
    aggregated.cpu = this.checkCpuService.calculateStatistics(this.windowSize)

    // 事件循环统计聚合
    aggregated.eventLoop = this.checkEventLoopService.calculateStatistics(this.windowSize)

    // GC统计聚合
    aggregated.gc = this.checkGcService.calculateStatistics(this.outputInterval)

    this.aggregatedMetrics.add(aggregated)

    this.logger.debug(`统计聚合完成 - 时间戳: ${new Date(now).toISOString()}`)
  }

  // 公共API方法

  /**
   * 获取实时采样数据（最近6次采样，约1分钟内）
   */
  public getRealTimeSamples(): RealTimeSamples {
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
  public getAggregatedMetrics(samples: number = 20): AggregatedMetrics[] {
    return this.aggregatedMetricsArray.slice(-samples) // 最近samples条记录
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
        } : null,
        cpu: latest?.cpu ? {
          avgLoad: `${latest.cpu.total.mean.toFixed(2)}%`,
          maxLoad: `${latest.cpu.total.max.toFixed(2)}%`,
        } : null,
        eventLoop: latest?.eventLoop ? {
          health: latest.eventLoop.healthScore > 80 ? 'excellent'
            : latest.eventLoop.healthScore > 60 ? 'good' : 'poor',
          avgDelay: `${(latest.eventLoop.mean.mean / 1000000).toFixed(2)}ms`,
        } : null,
        gc: latest?.gc ? {
          pressureScore: latest.gc.pressureScore,
          frequency: latest.gc.frequency,
          avgDuration: latest.gc.duration ? `${latest.gc.duration.mean.toFixed(2)}ms` : '0ms',
        } : null,
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

    if (this.aggregationInterval_)
      clearInterval(this.aggregationInterval_)

    // 清理小服务资源
    this.checkEventLoopService.destroy()
    this.checkGcService.destroy()

    this.checkCpuService.clearMetrics()
    this.checkEventLoopService.clearMetrics()
    this.checkMemService.clearMetrics()
    this.checkGcService.clearMetrics()

    this.logger.log('性能监控服务已关闭')
  }
}
