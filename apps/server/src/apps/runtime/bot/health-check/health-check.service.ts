import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { BotCoreRuntimeService } from '../core/bot-core-runtime.service'
import type { RingBuffer } from 'ring-buffer-ts'
import type { BotPluginStatusSnapshot, BotPluginStatusStatics } from '@shared/common/bot/health-check'

@Injectable()
export class BotHealthCheckService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(BotHealthCheckService.name)
  private readonly bufSize = 100
  private readonly botHealthCheckInterval = 10 * 1e3
  private readonly botHealthCheckStaticsInterval = 60 * 1e3

  private readonly botSnapshotBuf: Record<string, RingBuffer<BotPluginStatusSnapshot>> = {}
  private readonly botStaticsBuf: Record<string, RingBuffer<BotPluginStatusStatics>> = {}

  private recordInterval_: NodeJS.Timeout | null = null
  private staticsInterval_: NodeJS.Timeout | null = null

  constructor(@Inject(BotCoreRuntimeService) private readonly botCoreRuntimeService: BotCoreRuntimeService) {}

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
    if(this.recordInterval_) clearInterval(this.recordInterval_)
    if(this.staticsInterval_) clearInterval(this.staticsInterval_)
  }

  // snapshot 从bot中获取
  recordSnapshots() {

  }

  // statics 从snapshot中计算
  recordStatics() {

  }
}
