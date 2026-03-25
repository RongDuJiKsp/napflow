import { Logger } from '@nestjs/common'
import type { AgentSession } from '../instance'
import type { Socket } from 'socket.io'

export class SocketBindService {
  private readonly logger = new Logger('SocketBindService')
  private readonly socketToSessionMap = new Map<string, AgentSession>()

  getSessionBySocket(socket: Socket): AgentSession | null {
    return this.socketToSessionMap.get(socket.id) || null
  }

  bindSessionToSocket(session: AgentSession, socket: Socket) {
    this.socketToSessionMap.set(socket.id, session)
    session.mountToSocket(socket)
    this.logger.log(`Bound agent session ${session.sessionId} to socket ${socket.id}`)
  }

  unbindSessionFromSocket(socket: Socket) {
    const session = this.socketToSessionMap.get(socket.id)
    if (session) {
      session.unMountToSocket()
      this.socketToSessionMap.delete(socket.id)
      this.logger.log(`Unbound agent session ${session.sessionId} from socket ${socket.id}`)
    }
  }
}
