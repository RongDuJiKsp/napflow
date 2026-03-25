import { Inject, Injectable, Logger } from '@nestjs/common'
import { SocketBindService } from './socket-bind.service'
import type { Socket } from 'socket.io'

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name)
  constructor(
    @Inject(SocketBindService) private readonly socketBindService: SocketBindService,
  ) {}

  async handleChatQueryMessage(message: string, socket: Socket) {
    this.logger.log(`用户${socket.id}向模型发送了查询${message}`)
  }
}
