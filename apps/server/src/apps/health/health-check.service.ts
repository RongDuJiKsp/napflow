import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { CheckMemService } from './check-mem.service'
import type {} from './check-mem.service'
import { CheckCpuService } from './check-cpu.service'
import { CheckEventLoopService } from './check-event-loop.service'
import { CheckGcService } from './check-gc.service'
import { RingBuffer } from 'ring-buffer-ts'
import type {
  AggregatedMetrics,
  RealTimeSamples,
} from '@shared/common/health-check/health-check'

@Injectable()
export class HealthCheckService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HealthCheckService.name)

  // 监控配置
  private readonly collectInterval = 10 * 1e3 // 10秒采样一次
  private readonly outputInterval = 60 * 1e3 // 1分钟输出一次
  private readonly windowSize = 6 // 6个样本的窗口(1分钟)

  // 聚合统计数据
  private aggregatedMetrics: RingBuffer<AggregatedMetrics>
    = new RingBuffer<AggregatedMetrics>(100)

  get aggregatedMetricsArray(): AggregatedMetrics[] {
    return this.aggregatedMetrics.toArray()
  }

  // 监控器实例
  private collectInterval_: NodeJS.Timeout | null = null
  private aggregationInterval_: NodeJS.Timeout | null = null

  constructor(
    @Inject(CheckMemService) private readonly checkMemService: CheckMemService,
    @Inject(CheckCpuService) private readonly checkCpuService: CheckCpuService,
    @Inject(CheckEventLoopService)
    private readonly checkEventLoopService: CheckEventLoopService,
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
    this.checkMemService.collectSnapshot()
    this.checkCpuService.collectSnapshot()
    this.checkEventLoopService.collectSnapshot()
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
      sampleAtMs: now,
      memory: null,
      cpu: null,
      eventLoop: null,
      gc: null,
    }

    // 内存统计聚合
    aggregated.memory = this.checkMemService.calculateStatistics(
      this.windowSize,
    )

    // CPU统计聚合
    aggregated.cpu = this.checkCpuService.calculateStatistics(this.windowSize)

    // 事件循环统计聚合
    aggregated.eventLoop = this.checkEventLoopService.calculateStatistics(
      this.windowSize,
    )

    // GC统计聚合
    aggregated.gc = this.checkGcService.calculateStatistics(
      this.outputInterval,
    )

    this.aggregatedMetrics.add(aggregated)

    this.logger.debug(`统计聚合完成 - 时间戳: ${new Date(now).toISOString()}`)
  }

  private cleanup(): void {
    if (this.collectInterval_) clearInterval(this.collectInterval_)

    if (this.aggregationInterval_) clearInterval(this.aggregationInterval_)

    // 清理小服务资源
    this.checkEventLoopService.destroy()
    this.checkGcService.destroy()

    this.checkCpuService.clearMetrics()
    this.checkEventLoopService.clearMetrics()
    this.checkMemService.clearMetrics()
    this.checkGcService.clearMetrics()

    this.logger.log('性能监控服务已关闭')
  }

  getRealTimeSamples(): RealTimeSamples {
    const gcSnapshot = this.checkGcService.collectSnapshot(this.outputInterval)

    return {
      memory: this.checkMemService.getRecentMetrics(6),
      cpu: this.checkCpuService.getRecentMetrics(6),
      eventLoop: this.checkEventLoopService.getRecentMetrics(6),
      gc: gcSnapshot.recentGCs,
      timestamp: Date.now(),
      note: '最近6次采样数据（1分钟内）',
    }
  }

  getAggregatedMetrics(samples: number = 20): AggregatedMetrics[] {
    return this.aggregatedMetricsArray.slice(-samples)
  }
}
