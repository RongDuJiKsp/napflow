import type { ClientRPCMethods } from '@shared/rpc/agent/client-rpc/methods'
import { CLIENT_RPC_METHODS } from '@shared/rpc/agent/client-rpc/methods'
import type { RpcRecv } from '@shared/rpc/core/ts-check'
import { BaseClientRPCListener } from './base'

export type ClientRPCListenerHandler<K extends keyof ClientRPCMethods>
  = RpcRecv<ClientRPCMethods[K]['request'], ClientRPCMethods[K]['response']>
export class AgentClientRPCListener extends BaseClientRPCListener {
  private readonly methods: ClientRPCMethods = CLIENT_RPC_METHODS

  getRequestSchema<K extends keyof ClientRPCMethods>(
    method: K,
  ): ClientRPCMethods[K]['request'] {
    return this.methods[method].request
  }

  getResponseSchema<K extends keyof ClientRPCMethods>(
    method: K,
  ): ClientRPCMethods[K]['response'] {
    return this.methods[method].response
  }

  listenMethod<K extends keyof ClientRPCMethods>(
    method: K,
    handler: ClientRPCListenerHandler<K>,
  ) {
    return this.listen(
      method,
      this.getRequestSchema(method),
      this.getResponseSchema(method),
      handler,
    )
  }
}
