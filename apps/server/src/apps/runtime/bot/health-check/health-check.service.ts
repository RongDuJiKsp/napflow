import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { BotCoreRuntimeService } from '../core/bot-core-runtime.service'
import { RingBuffer } from 'ring-buffer-ts'
import type {
  BotPluginStatusSnapshot,
  BotPluginStatusStatics,
} from '@shared/common/bot/health-check'
import * as ss from 'simple-statistics'
@Injectable()
export class BotHealthCheckService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(BotHealthCheckService.name)
  private readonly snapshotBufsize = 20
  private readonly bufSize = 100
  private readonly botHealthCheckInterval = 10 * 1e3
  private readonly botHealthCheckStaticsInterval = 60 * 1e3

  private readonly botSnapshotBuf: Record<
    string,
    RingBuffer<BotPluginStatusSnapshot>
  > = {}

  private readonly botStaticsBuf: Record<
    string,
    RingBuffer<BotPluginStatusStatics>
  > = {}

  private recordInterval_: NodeJS.Timeout | null = null
  private staticsInterval_: NodeJS.Timeout | null = null

  constructor(
    @Inject(BotCoreRuntimeService)
    private readonly botCoreRuntimeService: BotCoreRuntimeService,
  ) {}

  async onModuleInit() {
    this.startBotHealthCheck()
  }

  async onModuleDestroy() {
    this.destroyService()
  }

  startBotHealthCheck() {
    this.recordInterval_ = setInterval(() => {
      this.recordSnapshots()
    }, this.botHealthCheckInterval)
    this.staticsInterval_ = setInterval(() => {
      this.recordStatics()
    }, this.botHealthCheckStaticsInterval)
  }

  destroyService() {
    if (this.recordInterval_) clearInterval(this.recordInterval_)
    if (this.staticsInterval_) clearInterval(this.staticsInterval_)
  }

  // snapshot 从bot中获取
  private recordSnapshots() {
    // 这里只管塞就行了 recordStatics会自动GC
    for (const bot of this.botCoreRuntimeService.botEntities) {
      if (!this.botSnapshotBuf[bot.botId]) {
        this.botSnapshotBuf[bot.botId]
          = new RingBuffer<BotPluginStatusSnapshot>(this.snapshotBufsize)
      }

      const buf = this.botSnapshotBuf[bot.botId]
      const snapshot = bot.botInstance.sourceSnapshot()
      if (!snapshot) continue
      buf.add(snapshot)
    }
  }

  // statics 从snapshot中计算
  private recordStatics() {
    for (const [botId, rec] of Object.entries(this.botSnapshotBuf)) {
      if (!this.botStaticsBuf[botId]) {
        this.botStaticsBuf[botId] = new RingBuffer<BotPluginStatusStatics>(
          this.bufSize,
        )
      }

      const buf = this.botStaticsBuf[botId]
      const snapArr = rec.toArray()
      delete this.botSnapshotBuf[botId]

      if (snapArr.length === 0) continue

      const taskQueueLength = snapArr.map(snap => snap.taskQueueLength)
      const nodeQueueLength = snapArr.map(snap => snap.nodeQueueLength)
      buf.add({
        sampleAtMs: Date.now(),
        taskQueueLength: {
          min: ss.min(taskQueueLength),
          max: ss.max(taskQueueLength),
          mean: ss.mean(taskQueueLength),
          median: ss.median(taskQueueLength),
          p95: ss.quantile(taskQueueLength, 0.95),
        },
        nodeQueueLength: {
          min: ss.min(nodeQueueLength),
          max: ss.max(nodeQueueLength),
          mean: ss.mean(nodeQueueLength),
          median: ss.median(nodeQueueLength),
          p95: ss.quantile(nodeQueueLength, 0.95),
        },
      })
    }
    this.logger.debug(`统计聚合完成 - 时间戳: ${new Date().toISOString()}`)
  }

  getRecordStatics(botId: string, window: number = 80) {
    return this.botStaticsBuf[botId]?.toArray().slice(-window) || []
  }
}
