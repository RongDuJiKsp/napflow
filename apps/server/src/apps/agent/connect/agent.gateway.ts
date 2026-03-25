import { Inject, Logger } from '@nestjs/common'
import type {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { AgentService } from './services/agent.service'
import { ZodCheckWsAgentConnectionRequest } from '@shared/common/agent/socketio/auth'
import { z } from 'zod'
import { ZodBody } from '@/src/decorator/zod'
import type { WsMessageEventChatQuery } from '@shared/common/agent/socketio/events'
import { ZodCheckWsMessageEventChatQuery } from '@shared/common/agent/socketio/events'
import { MessageService } from './services/message.service'
@WebSocketGateway<GatewayMetadata>({
  namespace: '/agent',
})
export class AgentGateway
implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
  private readonly logger = new Logger(AgentGateway.name)
  @WebSocketServer()
  server: Server

  constructor(
    @Inject(AgentService) private readonly agentService: AgentService,
    @Inject(MessageService) private readonly messageService: MessageService,
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
      this.logger.log(`Agent session established for client ${client.id}`)
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    await this.agentService.handleSessionDisconnection(client)
  }

  @SubscribeMessage('query')
  async handleChatQueryMessage(
    @ZodBody({ zod: ZodCheckWsMessageEventChatQuery })
    body: WsMessageEventChatQuery,
    @ConnectedSocket() socket: Socket,
  ) {
    await this.messageService.handleChatQueryMessage(body.query, socket)
  }
}
