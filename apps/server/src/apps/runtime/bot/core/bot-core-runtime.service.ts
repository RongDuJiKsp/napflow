import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { BotAdapterFactory, BotInstance } from '../adapter/_base'
import { NapcatWsAdapter, NapcatWsFactory } from '../adapter/napcatws'
import type { BotAdapterClass, BotState } from '@shared/common/bot/base'
import { AdapterTag, BotRunningState } from '@shared/common/bot/base'
import { BotCoreRuntimeError } from '../../middleware/bot-core-runtime.filter'
import { BotSignal } from '@shared/common/bot/base'
import { BotBridgeForBotService } from '../bridge/bot-bridge-for-bot'
import { AppConfigService } from '@/src/apps/app-config/app-config.service'

export const adapterFactory: Record<AdapterTag, BotAdapterFactory> = {
  [AdapterTag.napcatWs]: NapcatWsFactory,
}
export const adapterClassMeta: Record<AdapterTag, BotAdapterClass> = {
  [AdapterTag.napcatWs]: NapcatWsAdapter,
}

@Injectable()
export class BotCoreRuntimeService {
  private readonly botInstanceMap = new Map<string, BotInstance>()

  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
    @Inject(BotBridgeForBotService) private readonly bridge: BotBridgeForBotService,
    @Inject(AppConfigService) private readonly config: AppConfigService,
  ) {}

  get botInstances() {
    return Array.from(this.botInstanceMap.values())
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
    if (botInstance) return

    const botRecord = await this.db.botRecord.findOneBy({ recordId: botId })
    if (!botRecord) throw new BotCoreRuntimeError(`bot ${botId} not found`)

      // 测试时可能没绑定就启动了 先给个[] 后面可能强制绑定
    const adapter = await adapterFactory[botRecord.adapterTag](botRecord, await this.bridge.getBotBindingWorkflow(botId) || [], this.config)
    this.botInstanceMap.set(botId, adapter)
  }

  async stopBot(botId: string) {
    const botInstance = this.botInstanceMap.get(botId)
    if (!botInstance) return
    botInstance.signal(BotSignal.SIGSTOP)
  }
}
