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
import { ToolCallService } from './toolcall.service'
@WebSocketGateway({})
export class ToolCallGateway implements OnGatewayInit<Server>, OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
  @WebSocketServer()
  server: Server

  constructor(
    @Inject(ToolCallService) private readonly toolCallService: ToolCallService,
  ) {

  }

  afterInit(server: Server) {
    console.log('ToolCallGateway initialized')
  }

  handleConnection(client: Socket, ...args: any[]) {
    throw new Error('Method not implemented.')
  }

  handleDisconnect(client: Socket) {
    throw new Error('Method not implemented.')
  }
}
