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
import { AgentSessionRecoverService } from './agent-session-recover.service'

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(LangChainService)
    private readonly langChainService: LangChainService,
    @Inject(TypeOrmService) private readonly typeOrmService: TypeOrmService,
    @Inject(AgentSessionRecoverService) private readonly sessionRecoverService: AgentSessionRecoverService,
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

  async allocSessionToConnection(recordId: string, namespaceAppId: string, socket: Socket) {
    const langChainInstance
      = await this.langChainService.createLangChainInstanceByEndpointRecordId(
        recordId,
      )
    if (!langChainInstance) {
      this.logger.error(
        `Failed to create LangChainInstance for endpoint record id: ${recordId}`,
      )
      socket.disconnect(true)
      return null
    }
    const agentSession = new AgentSession(langChainInstance)
    agentSession.mountToSocket(socket)
    this.sessionRecoverService.registerSession(namespaceAppId, agentSession)
    return agentSession
  }

  async recoverSessionToConnection(recoverId: string, recoverAppId: string, socket: Socket) {
    const recoverdSession = this.sessionRecoverService.recoverSession(recoverAppId, recoverId)
    if(!recoverdSession) {
      this.logger.warn(
        `Failed to recover session for appId ${recoverAppId} with sessionId ${recoverId}`,
      )
      socket.disconnect(true)
      return null
    }
    // update socket connection
    recoverdSession.mountToSocket(socket)
    this.logger.log(
      `Successfully recovered session for appId ${recoverAppId} with sessionId ${recoverId} and associated it with new socket id ${socket.id}`,
    )
    return recoverdSession
  }

  async handleSessionConnection(
    socket: Socket,
    ...connArgs: WsConnectionRequest
  ) {
    const [authReq, agentReq, recoverReq] = connArgs

    if (!this.checkAuthConnectionSuccess(socket, authReq))
      return null

    if(recoverReq)
      return await this.recoverSessionToConnection(recoverReq.socketSessionId, recoverReq.appId, socket)

    if(agentReq)
      return await this.allocSessionToConnection(agentReq.recordId, authReq.token, socket)

    this.logger.error(
      `Connection from socket ${socket.id} does not contain valid agent request or recovery context`,
    )
    socket.disconnect(true)
    return null
  }
}
