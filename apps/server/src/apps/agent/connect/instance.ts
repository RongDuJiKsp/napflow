import { Logger } from '@nestjs/common'
import type { Socket } from 'socket.io'
import { genToolFromClientRPCMethodItem } from '../langchain/call-rpc'
import type { LangChainInstance } from '../langchain/instance'
import { LangChainClientRPC } from './client-rpc/client-rpc'

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
}

export class AgentSession {
  private readonly logger: Logger
  private readonly clientRpc: LangChainClientRPC
  private readonly rpcBridge: AgentRpcBridge

  constructor(
    private readonly socket: Socket,
    private readonly langChainInstance: LangChainInstance,
  ) {
    this.logger = new Logger(`AgentSession-${socket.id}`)
    this.clientRpc = new LangChainClientRPC(socket)
    this.rpcBridge = new AgentRpcBridge(this.clientRpc, langChainInstance)
  }
}
