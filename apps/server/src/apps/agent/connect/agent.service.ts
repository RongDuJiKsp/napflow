import { Injectable, Logger } from '@nestjs/common'
import type { Socket } from 'socket.io'
import type { LangChainInstance } from '../langchain/langchain.service'
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)
}

export class AgentSession {
  constructor(readonly socket: Socket, readonly langChainInstance: LangChainInstance) {

  }
}
