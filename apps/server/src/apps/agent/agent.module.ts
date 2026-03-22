import { Module } from '@nestjs/common'
import { AgentEndpointService } from './config/openai-endpoints/agent-endpoint.service'
import { AgentEndpointController } from './config/openai-endpoints/agent-endpoint.controller'
import { AgentGateway } from './connect/agent.gateway'
import { AgentService } from './connect/agent.service'

@Module({
  providers: [
    AgentEndpointService,
    AgentGateway,
    AgentService,
  ],
  exports: [
    AgentEndpointService,
    AgentService,
  ],
  controllers: [AgentEndpointController],
})
export class AgentModule {}
