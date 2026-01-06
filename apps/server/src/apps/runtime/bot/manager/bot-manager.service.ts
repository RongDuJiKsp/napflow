import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class BotManagerService {
  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
  ) {

  }

  allBots() {
    return this.db.botRecord.find()
  }
}
