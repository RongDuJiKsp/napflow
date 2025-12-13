import { Module } from '@nestjs/common'
import { CoreRuntimeService } from './core/coreruntime.service'
import { ManagerService } from './manager/manager.service'
import { ManagerController } from './manager/manager.controller'

@Module({
  providers: [CoreRuntimeService, ManagerService],
  exports: [CoreRuntimeService, ManagerService],
  controllers: [ManagerController],
})
export class RuntimeModule {}
