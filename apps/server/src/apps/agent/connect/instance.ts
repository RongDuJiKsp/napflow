import { Logger } from '@nestjs/common'
import type { Socket } from 'socket.io'
import type { LangChainInstance } from '../langchain/instance'
import { LangChainClientRPC as WorkflowEditorClientRPC } from './client-rpc/client-rpc'
import { v4 as uuidV4 } from 'uuid'

export class AgentSession {
  readonly sessionId = uuidV4()
  readonly createdAt = new Date()
  private readonly logger: Logger = new Logger(
    `AgentSession-${this.sessionId}`,
  )

  private readonly clientRpc: WorkflowEditorClientRPC = new WorkflowEditorClientRPC()
  private socket: Socket | null

  constructor(readonly langChain: LangChainInstance) {}

  mountToSocket(socket: Socket) {
    this.socket = socket
    this.clientRpc.mount(socket)
    this.logger.log(
      `Agent session ${this.sessionId} mounted to socket ${socket.id}`,
    )
  }

  unMountToSocket() {
    this.logger.log(
      `Agent session ${this.sessionId} unmounted from socket ${this.socket?.id}`,
    )
    this.socket = null
    this.clientRpc.unmount()
  }
}
