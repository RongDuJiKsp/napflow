import { Inject, Logger } from '@nestjs/common'
import type {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { AgentService } from './agent.service'
import { ZodCheckWsAgentConnectionRequest } from '@shared/common/agent/websocket'
import { z } from 'zod'
@WebSocketGateway<GatewayMetadata>({
  namespace: '/agent',
})
export class AgentGateway
implements
    OnGatewayConnection<Socket>,
    OnGatewayDisconnect<Socket> {
  private readonly logger = new Logger(AgentGateway.name)
  @WebSocketServer()
  server: Server

  constructor(
    @Inject(AgentService) private readonly agentService: AgentService,
  ) {}

  async handleConnection(client: Socket) {
    const connParams = ZodCheckWsAgentConnectionRequest.safeParse(
      client.handshake.auth,
    )
    if (!connParams.success) {
      this.logger.warn(
        `Invalid connection parameters from client ${client.id}: ${z.prettifyError(connParams.error)}`,
      )
      client.disconnect(true)
      return
    }
    const agentSession = await this.agentService.handleSessionConnection(
      client,
      connParams.data,
    )
    if (!agentSession) {
      this.logger.warn(
        `Failed to establish agent session for client ${client.id}`,
      )
    }
    else {
      this.logger.log(
        `Agent session established for client ${client.id}`,
      )
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    this.agentService.handleSessionDisconnection(client)
  }
}
