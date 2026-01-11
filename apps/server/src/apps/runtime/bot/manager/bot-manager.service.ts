import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { Account } from '@shared/common/account/base'
import type { CreateBotReq } from '@shared/data-transfer/bot/manager'
import {
  BotCoreRuntimeService,
  adapterClassMeta,
} from '../core/bot-core-runtime.service'
import { BotRunningState } from '@shared/common/bot/base'

const botStateWeight: Record<BotRunningState, number> = {
  [BotRunningState.stopped]: 0,
  [BotRunningState.killed]: 1,
  [BotRunningState.offline]: 2,
  [BotRunningState.fatal]: 3,
  [BotRunningState.running]: 4,
}

@Injectable()
export class BotManagerService {
  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
    @Inject(BotCoreRuntimeService)
    private readonly botCoreRuntimeService: BotCoreRuntimeService,
  ) {}

  async allBots() {
    return await this.db.botRecord.find()
  }

  async allBotsStatus() {
    const botRecords = await this.allBots()
    return botRecords
      .map((botRecord) => {
        return {
          botId: botRecord.recordId,
          adapterTag: botRecord.adapterTag,
          adapterDesc: adapterClassMeta[botRecord.adapterTag].meta.desc,
          botName: botRecord.name,
          botDesc: botRecord.description,
          state: this.botCoreRuntimeService.botState(botRecord.recordId),
        }
      })
      .sort((a, b) => {
        if (a.state.runningState === b.state.runningState) {
          return (
            (b.state.bootTime?.valueOf() ?? 0)
            - (a.state.bootTime?.valueOf() ?? 0)
          )
        }
        return (
          botStateWeight[b.state.runningState]
          - botStateWeight[a.state.runningState]
        )
      })
  }

  async createBot(createReq: CreateBotReq, author: Account) {
    return await this.db.botRecord.save({
      name: createReq.name,
      description: createReq.description,
      commonAdapterConfig: createReq.commonConfig,
      adapterTag: createReq.adapterTag,
      adapterConfig: createReq.adapterConfig,
      createdBy: author.email,
    })
  }
}
