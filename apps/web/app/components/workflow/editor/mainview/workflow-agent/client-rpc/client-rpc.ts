import { CLIENT_RPC_METHODS } from '@shared/rpc/agent/client-rpc/methods'
import type { RPCMethodItem } from '@shared/rpc/core/ts-check'
import type z from 'zod'
import { BaseClientRPCListener } from './base'

export type ClientRPCMethods = typeof CLIENT_RPC_METHODS
  & Record<string, RPCMethodItem>

export type MethodHandler<M extends Record<string, RPCMethodItem>, K extends keyof M> = (
  ...args: z.output<M[K]['request']>
) => Promise<z.input<M[K]['response']>> | z.input<M[K]['response']>

export type ClientRPCListenerHandler<K extends keyof ClientRPCMethods> = (
  ...args: z.output<ClientRPCMethods[K]['request']>
) => Promise<z.input<ClientRPCMethods[K]['response']>>

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
    handler: MethodHandler<ClientRPCMethods, K>,
  ) {
    return this.listen(
      method,
      this.getRequestSchema(method),
      this.getResponseSchema(method),
      handler,
    )
  }
}
