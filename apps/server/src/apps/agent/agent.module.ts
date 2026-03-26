import { Module } from '@nestjs/common'
import { AgentEndpointService } from './config/openai-endpoints/agent-endpoint.service'
import { AgentEndpointController } from './config/openai-endpoints/agent-endpoint.controller'
import { AgentGateway } from './connect/agent.gateway'
import { AgentSessionRecoverController } from './connect/session-recover/agent-session-recover.controller'
import { AgentService } from './connect/services/agent.service'
import { AgentSessionRecoverService } from './connect/session-recover/agent-session-recover.service'
import { SocketBindService } from './connect/services/socket-bind.service'
import { MessageService } from './connect/services/message.service'

@Module({
  providers: [
    AgentEndpointService,
    AgentSessionRecoverService,
    SocketBindService,
    MessageService,
    AgentGateway,
    AgentService,
  ],
  exports: [
    AgentEndpointService,
    AgentSessionRecoverService,
    SocketBindService,
    MessageService,
    AgentService,
  ],
  controllers: [AgentEndpointController, AgentSessionRecoverController],
})
export class AgentModule {}
