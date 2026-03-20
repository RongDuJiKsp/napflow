import { Module } from '@nestjs/common'
import { AgentEndPointService } from './config/openai-endpoints/agent-endpoint.service'
import { AgentConfigController } from './config/agent-config.controller'

@Module({
  providers: [AgentEndPointService],
  exports: [AgentEndPointService],
  controllers: [AgentConfigController],
})
export class AgentModule {}
