import { Logger } from '@nestjs/common'
import type { Socket } from 'socket.io'
import { LangChainClientRPC as WorkflowEditorClientRPC } from './client-rpc/client-rpc'
import { v4 as uuidV4 } from 'uuid'
import type { OpenAiEndpointConfig } from '@shared/common/agent/entity'
import { LangChainInstance } from '../langchain/instance'

export class AgentSession {
  readonly sessionId = uuidV4()
  readonly createdAt = new Date()
  private readonly logger: Logger = new Logger(
    `AgentSession-${this.sessionId}`,
  )

  private readonly clientRpc: WorkflowEditorClientRPC = new WorkflowEditorClientRPC()
  readonly langChain: LangChainInstance
  socket: Socket | null

  constructor(readonly apiConfig: OpenAiEndpointConfig) {
    this.langChain = new LangChainInstance(apiConfig)
  }

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

  get safeSocket() {
    if (!this.socket)
      throw new Error(`Socket is not mounted for agent session ${this.sessionId}`)

    return this.socket
  }

  async invokeChat(message: string) {
    this.logger.log(`Invoking chat with message: ${message}`)
    const { diff } = await this.langChain.invokeChat(message)
    for(const msg of diff)
      this.safeSocket.emit('query.response', msg.toDict())
  }
}
