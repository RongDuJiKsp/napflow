import { Logger } from '@nestjs/common'
import type { Socket } from 'socket.io'
import { genToolFromClientRPCMethodItem } from '../langchain/call-rpc'
import type { LangChainInstance } from '../langchain/instance'
import { LangChainClientRPC } from './client-rpc/client-rpc'
import { v4 as uuidV4 } from 'uuid'
export class AgentRpcBridge {
  constructor(
    private readonly clientRpc: LangChainClientRPC,
    private readonly langChainInstance: LangChainInstance,
  ) {
    // add tools
    langChainInstance.dynTool.addTool(
      genToolFromClientRPCMethodItem(
        'addCustomNode',
        this.clientRpc.getHandler('addCustomNode'),
        {
          description: '向工作流中添加一个自定义节点',
        },
      ),
    )
    langChainInstance.dynTool.addTool(
      genToolFromClientRPCMethodItem(
        'readCurrent',
        this.clientRpc.getHandler('readCurrent'),
        {
          description: '读取当前工作流的草稿数据',
        },
      ),
    )
  }

  destroy() {
    this.langChainInstance.dynTool.cleanAllTools()
  }
}

export class AgentSession {
  readonly sessionId = uuidV4()
  readonly createdAt = new Date()
  private readonly logger: Logger = new Logger(
    `AgentSession-${this.sessionId}`,
  )

  private socket: Socket | null
  private clientRpc: LangChainClientRPC | null
  private rpcBridge: AgentRpcBridge | null

  constructor(readonly langChain: LangChainInstance) {}

  mountToSocket(socket: Socket) {
    this.socket = socket
    this.clientRpc = new LangChainClientRPC(socket)
    this.rpcBridge = new AgentRpcBridge(this.clientRpc, this.langChain)
    this.logger.log(
      `Agent session ${this.sessionId} mounted to socket ${socket.id}`,
    )
  }

  unMountToSocket() {
    this.logger.log(
      `Agent session ${this.sessionId} unmounted from socket ${this.socket?.id}`,
    )
    this.rpcBridge?.destroy()
    this.socket = null
    this.clientRpc = null
    this.rpcBridge = null
  }
}
