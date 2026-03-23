import { Module } from '@nestjs/common'
import { AgentEndpointService } from './config/openai-endpoints/agent-endpoint.service'
import { AgentEndpointController } from './config/openai-endpoints/agent-endpoint.controller'
import { AgentGateway } from './connect/agent.gateway'
import { AgentService } from './connect/agent.service'
import { LangChainService } from './langchain/langchain.service'

@Module({
  providers: [AgentEndpointService, AgentGateway, AgentService, LangChainService],
  exports: [AgentEndpointService, AgentService, LangChainService],
  controllers: [AgentEndpointController],
})
export class AgentModule {}
