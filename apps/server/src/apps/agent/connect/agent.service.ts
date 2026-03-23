import { Inject, Injectable, Logger } from '@nestjs/common'
import type { Socket } from 'socket.io'
import type {
  WsAuthRequest,
  WsConnectionRequest,
} from '@shared/common/agent/websocket'
import { JwtService } from '../../account/jwt.service'
import { LangChainService } from '../langchain/langchain.service'
import { TypeOrmService } from '../../db/typeorm.service'
import { AgentSession } from './instance'

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(LangChainService)
    private readonly langChainService: LangChainService,
    @Inject(TypeOrmService) private readonly typeOrmService: TypeOrmService,
  ) {}

  private checkAuthConnectionSuccess(socket: Socket, auth: WsAuthRequest) {
    const user = this.jwtService.account.jwtVerify(auth.token)
    if (!user) {
      this.logger.log(
        `Unauthorized connection attempt with token: ${auth.token}`,
      )
      socket.disconnect(true)
      return false
    }
    this.logger.log(`User ${user.email} connected with socket id ${socket.id}`)
    return true
  }

  async handleSessionConnection(
    socket: Socket,
    ...connArgs: WsConnectionRequest
  ) {
    const [authReq, agentReq, recoverReq] = connArgs

    if (!this.checkAuthConnectionSuccess(socket, authReq)) return null

    const langChainInstance
      = await this.langChainService.createLangChainInstanceByEndpointRecordId(
        agentReq.recordId,
      )
    if (!langChainInstance) {
      this.logger.error(
        `Failed to create LangChainInstance for endpoint record id: ${agentReq.recordId}`,
      )
      socket.disconnect(true)
      return null
    }

    return new AgentSession(socket, langChainInstance)
  }
}
