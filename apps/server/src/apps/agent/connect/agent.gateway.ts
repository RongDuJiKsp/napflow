import { Inject } from '@nestjs/common'
import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets'
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { AgentService } from './agent.service'
@WebSocketGateway({})
export class AgentGateway implements OnGatewayInit<Server>, OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
  @WebSocketServer()
  server: Server

  constructor(
    @Inject(AgentService) private readonly agentService: AgentService,
  ) {

  }

  afterInit(server: Server) {
    console.log('AgentGateway initialized')
  }

  handleConnection(client: Socket, ...args: any[]) {
    throw new Error('Method not implemented.')
  }

  handleDisconnect(client: Socket) {
    throw new Error('Method not implemented.')
  }
}
