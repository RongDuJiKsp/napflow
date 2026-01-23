import { Module } from '@nestjs/common'
import { CoreRuntimeService } from './core/coreruntime.service'
import { ManagerService } from './manager/manager.service'
import { ManagerController } from './manager/manager.controller'
import { BotCoreRuntimeService } from './bot/core/bot-core-runtime.service'
import { BotManagerService } from './bot/manager/bot-manager.service'
import { BotManagerController } from './bot/manager/bot-manager.controller'

@Module({
  providers: [
    CoreRuntimeService,
    ManagerService,
    BotCoreRuntimeService,
    BotManagerService,
  ],
  exports: [
    CoreRuntimeService,
    BotCoreRuntimeService,
    ManagerService,
    BotManagerService,
  ],
  controllers: [ManagerController, BotManagerController],
})
export class RuntimeModule {}
