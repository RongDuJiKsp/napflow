import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import { type BotAdapterFactory, type BotInstance, BotSignal } from '../adapter/_base'
import { NapcatWsAdapter, NapcatWsFactory } from '../adapter/napcatws'
import type { BotAdapterClass, BotState } from '@shared/data-transfer/bot/_base'
import { AdapterTag, BotRunningState } from '@shared/data-transfer/bot/_base'
import { BotCoreRuntimeError } from '../../middleware/bot-core-runtime.filter'

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
    if(botInstance)
      return

    const botRecord = await this.db.botRecord.findOneBy({ recordId: botId })
    if (!botRecord) throw new BotCoreRuntimeError(`bot ${botId} not found`)

    const adapter = await adapterFactory[botRecord.adapterTag](botRecord)
    this.botInstanceMap.set(botId, adapter)
  }

  async stopBot(botId: string) {
    const botInstance = this.botInstanceMap.get(botId)
    if(!botInstance)
      return
    botInstance.signal(BotSignal.SIGSTOP)
  }
}
