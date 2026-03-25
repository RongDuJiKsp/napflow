import { Module } from '@nestjs/common'
import { AgentEndpointService } from './config/openai-endpoints/agent-endpoint.service'
import { AgentEndpointController } from './config/openai-endpoints/agent-endpoint.controller'
import { AgentGateway } from './connect/agent.gateway'
import { AgentSessionRecoverController } from './connect/session-recover/agent-session-recover.controller'
import { AgentService } from './connect/agent.service'
import { LangChainService } from './langchain/langchain.service'
import { AgentSessionRecoverService } from './connect/session-recover/agent-session-recover.service'
import { SocketBindService } from './connect/socket-bind.service'

@Module({
  providers: [AgentEndpointService, AgentSessionRecoverService, SocketBindService, AgentGateway, AgentService, LangChainService],
  exports: [AgentEndpointService, AgentSessionRecoverService, SocketBindService, AgentService, LangChainService],
  controllers: [AgentEndpointController, AgentSessionRecoverController],
})
export class AgentModule {}
