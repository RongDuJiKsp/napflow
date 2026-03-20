import { Inject, Injectable } from '@nestjs/common'
import { BotBridgeForBotService } from '../bridge/bot-bridge-for-bot'
import { AppConfigService } from '@/src/apps/app-config/app-config.service'
import type { BotAdapterClass } from '@shared/common/bot/core/adapter'
import { AdapterTag } from '@shared/common/bot/core/adapter'
import type { BotAdapterFactory } from '../adapter/_base'
import { NapcatWsAdapter, NapcatWsFactory } from '../adapter/napcatws'
import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { BotCoreRuntimeError } from '../../middleware/bot-core-runtime.filter'

export const adapterFactory: Record<AdapterTag, BotAdapterFactory> = {
  [AdapterTag.napcatWs]: NapcatWsFactory,
}
export const adapterClassMeta: Record<AdapterTag, BotAdapterClass> = {
  [AdapterTag.napcatWs]: NapcatWsAdapter,
}

@Injectable()
export class BotFactoryService {
  constructor(
    @Inject(BotBridgeForBotService)
    private readonly bridge: BotBridgeForBotService,
    @Inject(AppConfigService) private readonly config: AppConfigService,
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
  ) {}

  async createBot(botId: string) {
    const botRecord = await this.db.botRecord.findOneBy({ botId })
    if (!botRecord) throw new BotCoreRuntimeError(`bot ${botId} not found`)
    // 测试时可能没绑定就启动了 先给个[] 后面可能强制绑定
    return await adapterFactory[botRecord.adapterTag](
      botRecord,
      (await this.bridge.getBotBindingWorkflow(botId)) || [],
      this.config,
      this.bridge,
    )
  }

  static getAdapterClass(tag: AdapterTag) {
    return adapterClassMeta[tag]
  }
}
