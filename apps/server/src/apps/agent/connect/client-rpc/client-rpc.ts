import type z from 'zod'
import { CLIENT_RPC_METHODS } from '@shared/rpc/agent/client-rpc/methods'
import type { RPCMethodItem } from '@shared/rpc/core/ts-check'
import { BaseClientRPCRequester } from './base'

export type ClientRPCMethods = typeof CLIENT_RPC_METHODS
  & Record<string, RPCMethodItem>
export type ClientRPCHandler<K extends keyof ClientRPCMethods> = (
  ...args: z.input<ClientRPCMethods[K]['request']>
) => Promise<z.output<ClientRPCMethods[K]['response']>>
/**
 * @description: client rpc 即从客户端拉数据到服务端 这里是具体方法的实现类，
 * BaseLangChainClientRPCRequester 是基础类，提供了 emit 和 emitWithSchema 两个方法，前者直接发请求，后者带参数和响应的 schema 验证
 */
export class WorkflowEditorClientRPC extends BaseClientRPCRequester {
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

  getHandler<K extends keyof ClientRPCMethods>(method: K): ClientRPCHandler<K> {
    const requestSchema = this.getRequestSchema<K>(method)
    const responseSchema = this.getResponseSchema<K>(method)
    return (...args: z.input<typeof requestSchema>) =>
      this.emitWithSchema(requestSchema, responseSchema, method, ...args)
  }
}
