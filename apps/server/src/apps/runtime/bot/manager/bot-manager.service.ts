import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { Account } from '@shared/common/account/base'
import type {
  CreateBotReq,
  UpdateBotReq,
} from '@shared/data-transfer/bot/manager'
import { BotCoreRuntimeService } from '../core/bot-core-runtime.service'
import { BotRunningState } from '@shared/common/bot/base'
import { BotFactoryService } from '../core/bot-factory.service'
import { CommError } from '@/src/apps/middleware/commerror.filter'
import { Code } from '@shared/data-transfer/_base'

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
          botId: botRecord.botId,
          adapterTag: botRecord.adapterTag,
          adapterDesc: BotFactoryService.getAdapterClass(botRecord.adapterTag)
            ?.meta.desc,
          botName: botRecord.botName,
          botDesc: botRecord.description,
          state: this.botCoreRuntimeService.botState(botRecord.botId),
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

  async updateBot(botId: string, updateReq: UpdateBotReq) {
    const botRecord = await this.db.botRecord.findOne({
      where: { botId: botId },
    })
    if (!botRecord) throw new CommError('Bot记录不存在', Code.NotFound, 'warn')
    botRecord.botName = updateReq.name
    botRecord.description = updateReq.description
    return await this.db.botRecord.save(botRecord)
  }
}
