import { Module } from '@nestjs/common'
import { AgentEndpointService } from './config/openai-endpoints/agent-endpoint.service'
import { AgentEndpointController } from './config/openai-endpoints/agent-endpoint.controller'

@Module({
  providers: [AgentEndpointService],
  exports: [AgentEndpointService],
  controllers: [AgentEndpointController],
})
export class AgentModule {}
