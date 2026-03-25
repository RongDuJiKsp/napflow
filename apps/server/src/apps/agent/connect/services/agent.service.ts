import { Inject, Injectable, Logger } from '@nestjs/common'
import type { Socket } from 'socket.io'
import type {
  WsAgentMessageRecoveryContext,
  WsAgentModel,
  WsAuthRequest,
  WsConnectionRequest,
} from '@shared/common/agent/socketio/auth'
import { JwtService } from '../../../account/jwt.service'
import { LangChainService } from '../../langchain/langchain.service'
import { TypeOrmService } from '../../../db/typeorm.service'
import { AgentSession } from '../instance'
import { AgentSessionRecoverService } from '../session-recover/agent-session-recover.service'
import { SocketBindService } from './socket-bind.service'

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(LangChainService)
    private readonly langChainService: LangChainService,
    @Inject(TypeOrmService) private readonly typeOrmService: TypeOrmService,
    @Inject(AgentSessionRecoverService) private readonly sessionRecoverService: AgentSessionRecoverService,
    @Inject(SocketBindService) private readonly socketBindService: SocketBindService,
  ) {}

  private checkAuthConnectionSuccess(auth: WsAuthRequest, socket: Socket) {
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

  async allocSessionToConnection(model: WsAgentModel, socket: Socket) {
    const langChainInstance
      = await this.langChainService.createLangChainInstanceByEndpointRecordId(
        model.recordId,
      )
    if (!langChainInstance) {
      this.logger.error(
        `Failed to create LangChainInstance for endpoint record id: ${model.recordId}`,
      )
      socket.disconnect(true)
      return null
    }
    const agentSession = new AgentSession(langChainInstance)
    this.socketBindService.bindSessionToSocket(agentSession, socket)
    this.sessionRecoverService.registerSession(model.appId, agentSession)
    return agentSession
  }

  async recoverSessionToConnection(recover: WsAgentMessageRecoveryContext, socket: Socket) {
    const recoverdSession = this.sessionRecoverService.recoverSession(recover.appId, recover.socketSessionId)
    if(!recoverdSession) {
      this.logger.warn(
        `Failed to recover session for appId ${recover.appId} with sessionId ${recover.socketSessionId}`,
      )
      socket.disconnect(true)
      return null
    }
    // update socket connection
    this.socketBindService.bindSessionToSocket(recoverdSession, socket)
    this.logger.log(
      `Successfully recovered session for appId ${recover.appId} with sessionId ${recover.socketSessionId} and associated it with new socket id ${socket.id}`,
    )
    return recoverdSession
  }

  async handleSessionConnection(
    socket: Socket,
    connReq: WsConnectionRequest,
  ) {
    const { auth: authReq, model, recovery } = connReq

    if (!this.checkAuthConnectionSuccess(authReq, socket))
      return null

    if (recovery)
      return await this.recoverSessionToConnection(recovery, socket)

    if (model)
      return await this.allocSessionToConnection(model, socket)

    this.logger.error(
      `Connection from socket ${socket.id} does not contain valid agent request or recovery context`,
    )
    socket.disconnect(true)
    return null
  }

  async handleSessionDisconnection(socket: Socket) {
    this.socketBindService.unbindSessionFromSocket(socket)
  }
}
