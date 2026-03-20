import { Module } from '@nestjs/common'
import { CoreRuntimeService } from './core/coreruntime.service'
import { ManagerService } from './manager/manager.service'
import { ManagerController } from './manager/manager.controller'
import { BotCoreRuntimeService } from './bot/core/bot-core-runtime.service'
import { BotManagerService } from './bot/manager/bot-manager.service'
import { BotManagerController } from './bot/manager/bot-manager.controller'
import { BotRuntimeController } from './bot/manager/bot-runtime.controller'
import { BotBridgeService } from './bot/bridge/bot-bridge.service'
import { BotBridgeController } from './bot/bridge/bot-bridge.controller'
import { BotBridgeForBotService } from './bot/bridge/bot-bridge-for-bot'
import { BotHealthCheckService } from './bot/health-check/health-check.service'
import { BotHealthCheckController } from './bot/health-check/health-check.controller'
import { BotFactoryService } from './bot/core/bot-factory.service'

@Module({
  providers: [
    BotBridgeForBotService,
    CoreRuntimeService,
    ManagerService,
    BotFactoryService,
    BotCoreRuntimeService,
    BotManagerService,
    BotBridgeService,
    BotHealthCheckService,
  ],
  exports: [
    BotBridgeForBotService,
    CoreRuntimeService,
    BotFactoryService,
    BotCoreRuntimeService,
    ManagerService,
    BotManagerService,
    BotBridgeService,
    BotHealthCheckService,
  ],
  controllers: [
    ManagerController,
    BotManagerController,
    BotRuntimeController,
    BotBridgeController,
    BotHealthCheckController,
  ],
})
export class RuntimeModule {}
