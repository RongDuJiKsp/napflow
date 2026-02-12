import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { BotInstance } from '../adapter/_base'
import type { BotState } from '@shared/common/bot/base'
import { BotRunningState, BotRunningStateUtils } from '@shared/common/bot/base'
import { BotSignal } from '@shared/common/bot/base'
import { BotBridgeForBotService } from '../bridge/bot-bridge-for-bot'
import { AppConfigService } from '@/src/apps/app-config/app-config.service'
import { BotFactoryService } from './bot-factory.service'

@Injectable()
export class BotCoreRuntimeService {
  private readonly botInstanceMap = new Map<string, BotInstance>()

  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
    @Inject(BotBridgeForBotService)
    private readonly bridge: BotBridgeForBotService,
    @Inject(AppConfigService) private readonly config: AppConfigService,
    @Inject(BotFactoryService) private readonly botFactory: BotFactoryService,
  ) {}

  get botIds() {
    return Array.from(this.botInstanceMap.keys())
  }

  get botInstances() {
    return Array.from(this.botInstanceMap.values())
  }

  get botEntities() {
    return Array.from(this.botInstanceMap.entries()).map(
      ([botId, botInstance]) => ({ botId, botInstance }),
    )
  }

  botState(botId: string): BotState {
    const botInstance = this.botInstanceMap.get(botId)
    if (!botInstance) {
      return {
        runningState: BotRunningState.stopped,
      }
    }
    return botInstance.runningState()
  }

  async runBot(botId: string) {
    const botInstance = this.botInstanceMap.get(botId)
    if (
      botInstance
      && BotRunningStateUtils.isRunning(botInstance.runningState().runningState)
    )
      return

    const adapter = await this.botFactory.createBot(botId)
    this.botInstanceMap.set(botId, adapter)
  }

  async stopBot(botId: string) {
    const botInstance = this.botInstanceMap.get(botId)
    if (!botInstance) return
    botInstance.signal(BotSignal.SIGSTOP)
  }

  async killBot(botId: string) {
    const botInstance = this.botInstanceMap.get(botId)
    if (!botInstance) return
    botInstance.signal(BotSignal.SIGKILL)
  }

  async reloadBot(botId: string) {
    this.botInstanceMap.delete(botId)
    await this.runBot(botId)
  }
}
