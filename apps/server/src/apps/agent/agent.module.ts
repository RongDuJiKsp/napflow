import { Module } from '@nestjs/common'
import { AgentEndPointService } from './config/openai-endpoints/agent-endpoint.service'
import { AgentEndpointController } from './config/openai-endpoints/agent-endpoint.controller'

@Module({
  providers: [AgentEndPointService],
  exports: [AgentEndPointService],
  controllers: [AgentEndpointController],
})
export class AgentModule {}
