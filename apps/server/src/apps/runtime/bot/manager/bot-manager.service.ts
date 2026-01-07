import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { Account } from '@shared/common/account/base'
import type { CreateBotReq } from '@shared/data-transfer/bot/manager'

@Injectable()
export class BotManagerService {
  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
  ) {

  }

  async allBots() {
    return await this.db.botRecord.find()
  }

  async createBot(createReq: CreateBotReq, author: Account) {
    return await this.db.botRecord.save({
      name: createReq.name,
      description: createReq.description,
      adapterTag: createReq.adapterTag,
      adapterConfig: createReq.adapterConfig,
      createdBy: author.email,
    })
  }
}
