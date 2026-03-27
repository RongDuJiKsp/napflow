import type z from 'zod'
import type { ClientRPCHandler, ClientRPCMethods } from '@shared/rpc/agent/client-rpc/methods'
import { CLIENT_RPC_METHODS } from '@shared/rpc/agent/client-rpc/methods'
import { BaseClientRPCRequester } from './base'

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
    const handler = (...args: z.input<typeof requestSchema>) => this.emitWithSchema<typeof requestSchema, typeof responseSchema>(requestSchema, responseSchema, method, ...args)
    return handler as ClientRPCHandler<K>
  }

  hasMethod(method: string): method is keyof ClientRPCMethods {
    return method in this.methods
  }

  get methodsList() {
    return Object.keys(this.methods) as (keyof ClientRPCMethods)[]
  }
}
