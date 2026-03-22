import type { Socket } from 'socket.io'
import z from 'zod'
import { ClientRPCError } from '../middleware/client-rpc.filter'
import { ZodRpcAddCustomNodeRequest, ZodRpcAddCustomNodeResponse, ZodRpcReadCurrentRequest, ZodRpcReadCurrentResponse } from './schemas'

export class BaseLangChainClientRPCRequester {
  constructor(
    private readonly socket: Socket,
  ) {}

  async emit<A extends any[], R>(...args: A): Promise<R> {
    return new Promise((resolve) => {
      this.socket.emit('client-rpc', args, (response: R) => {
        resolve(response)
      })
    })
  }

  async emitWithSchema<PS extends z.ZodTuple<any, any>, RS extends z.ZodTypeAny>(
    paramSchema: PS,
    responseSchema: RS,
    ...args: z.input<PS>
  ): Promise<z.output<RS>> {
    const parseResult = paramSchema.safeParse(args)
    if (!parseResult.success)
      throw new ClientRPCError(`Invalid arguments: ${z.prettifyError(parseResult.error)}`)

    const response = await this.emit(...parseResult.data)
    const resp = responseSchema.safeParse(response)
    if (!resp.success) throw new ClientRPCError(`Invalid response: ${z.prettifyError(resp.error)}`)

    return resp.data
  }
}
// 类型打字约束
const defineRpcMethod = <M extends Record<string, { request: z.ZodTuple<any, any>; response: z.ZodTypeAny }>>(methods: M): M => methods
/**
 * @description: client rpc 即从客户端拉数据到服务端 这里是具体方法的实现类，
 * BaseLangChainClientRPCRequester 是基础类，提供了 emit 和 emitWithSchema 两个方法，前者直接发请求，后者带参数和响应的 schema 验证
 */
export class LangChainClientRPC extends BaseLangChainClientRPCRequester {
  private readonly methods = defineRpcMethod({
    addCustomNode: {
      request: ZodRpcAddCustomNodeRequest,
      response: ZodRpcAddCustomNodeResponse,
    },
    readCurrent: {
      request: ZodRpcReadCurrentRequest,
      response: ZodRpcReadCurrentResponse,
    },
  })

  getRequestSchema<K extends keyof typeof this.methods>(method: K): (typeof this.methods)[K]['request'] {
    return this.methods[method].request
  }

  getResponseSchema<K extends keyof typeof this.methods>(method: K): (typeof this.methods)[K]['response'] {
    return this.methods[method].response
  }

  getHandler<K extends keyof typeof this.methods>(method: K) {
    const requestSchema = this.getRequestSchema(method)
    const responseSchema = this.getResponseSchema(method)
    return (...args: z.input<typeof requestSchema>) => this.emitWithSchema(requestSchema, responseSchema, ...args)
  }
}
