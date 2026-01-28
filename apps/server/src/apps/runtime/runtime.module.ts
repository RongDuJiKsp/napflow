import { Module } from '@nestjs/common'
import { CoreRuntimeService } from './core/coreruntime.service'
import { ManagerService } from './manager/manager.service'
import { ManagerController } from './manager/manager.controller'
import { BotCoreRuntimeService } from './bot/core/bot-core-runtime.service'
import { BotManagerService } from './bot/manager/bot-manager.service'
import { BotManagerController } from './bot/manager/bot-manager.controller'
import { BotBridgeService } from './bot/bridge/bot-bridge.service'
import { BotBridgeController } from './bot/bridge/bot-bridge.controller'
import { BotBridgeForBotService } from './bot/bridge/bot-bridge-for-bot'

@Module({
  providers: [
    BotBridgeForBotService,
    CoreRuntimeService,
    ManagerService,
    BotCoreRuntimeService,
    BotManagerService,
    BotBridgeService,
  ],
  exports: [
    BotBridgeForBotService,
    CoreRuntimeService,
    BotCoreRuntimeService,
    ManagerService,
    BotManagerService,
    BotBridgeService,
  ],
  controllers: [ManagerController, BotManagerController, BotBridgeController],
})
export class RuntimeModule {}
