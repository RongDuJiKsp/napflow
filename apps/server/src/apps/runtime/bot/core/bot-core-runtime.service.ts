import type { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Injectable } from '@nestjs/common'
import type { BotAdapterFactory, BotInstance } from '../adapter/_base'
import { AdapterTag } from '../adapter/_base'
import { NapcatWsFactory } from '../adapter/napcat'

const initFromDBFnMap: Record<AdapterTag, BotAdapterFactory> = {
  [AdapterTag.napcatWs]: NapcatWsFactory,
}

@Injectable()
export class BotCoreRuntimeService {
  constructor(
    private readonly db: TypeOrmService,
    private readonly instances: BotInstance[],
  ) {
  }

  static async initFromDB(db: TypeOrmService): Promise<BotCoreRuntimeService> {
    const adapters = await db.botRecord.find()
    return new BotCoreRuntimeService(db, adapters.map(adapter => initFromDBFnMap[adapter.adapterTag](adapter)))
  }
}
