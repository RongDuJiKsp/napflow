import { Module } from '@nestjs/common'
import { AgentEndpointService } from './config/openai-endpoints/agent-endpoint.service'
import { AgentEndpointController } from './config/openai-endpoints/agent-endpoint.controller'
import { ToolCallGateway } from './connect/toolcall.gateway'
import { ToolCallService } from './connect/toolcall.service'

@Module({
  providers: [
    AgentEndpointService,
    ToolCallGateway,
    ToolCallService],
  exports: [
    AgentEndpointService,
    ToolCallService,
  ],
  controllers: [AgentEndpointController],
})
export class AgentModule {}
