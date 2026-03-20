import { Module } from '@nestjs/common'
import { AgentService } from './agent.service'
import { AgentController } from './agent.controller'

@Module({
  providers: [AgentService],
  exports: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
