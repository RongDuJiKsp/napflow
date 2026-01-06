import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { BotAdapterFactory, BotInstance } from '../adapter/_base'
import { NapcatWsAdapter, NapcatWsFactory } from '../adapter/napcat'
import type { BotAdapterClass, BotStateType } from '@shared/data-transfer/bot/_base'
import { AdapterTag, BotRunningState } from '@shared/data-transfer/bot/_base'

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
  ) {
  }

  get botInstances() {
    return Array.from(this.botInstanceMap.values())
  }

  botState(botId: string): BotStateType {
    const botInstance = this.botInstanceMap.get(botId)
    if (!botInstance) {
      return {
        runningState: BotRunningState.stopped,
      }
    }
    return botInstance.runningState()
  }
}
