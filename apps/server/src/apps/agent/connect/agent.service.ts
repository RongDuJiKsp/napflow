import { Injectable, Logger } from '@nestjs/common'
import type { Socket } from 'socket.io'
import type { LangChainInstance } from '../langchain/instance'
import { LangChainClientRPC } from './client-rpc/client-rpc'
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)
}

export class AgentSession {
  private readonly logger: Logger
  private readonly clientRpc: LangChainClientRPC

  constructor(private readonly socket: Socket, private readonly langChainInstance: LangChainInstance) {
    this.logger = new Logger(`AgentSession-${socket.id}`)
    this.clientRpc = new LangChainClientRPC(socket)

    // add tools
  }
}
