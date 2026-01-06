import { Module } from '@nestjs/common'
import { CoreRuntimeService } from './core/coreruntime.service'
import { ManagerService } from './manager/manager.service'
import { ManagerController } from './manager/manager.controller'
import { BotCoreRuntimeService } from './bot/core/bot-core-runtime.service'
import { TypeOrmService } from '../db/typeorm.service'

@Module({
  providers: [
    CoreRuntimeService,
    {
      provide: BotCoreRuntimeService,
      useFactory: async (db: TypeOrmService) => {
        return await BotCoreRuntimeService.initFromDB(db)
      },
      inject: [TypeOrmService],
    },
    ManagerService,
  ],
  exports: [CoreRuntimeService, BotCoreRuntimeService, ManagerService],
  controllers: [ManagerController],
})
export class RuntimeModule {}
