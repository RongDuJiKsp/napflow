import type z from 'zod'

// 规定 所有的rpc都满足 request 是一个 zod tuple（对应 args list） response 是一个 zod object 以此来保证参数和响应的类型安全

export type RpcPS = z.ZodTuple
export type RpcRS = z.ZodObject

export type RPCMethodItem = {
  request: RpcPS;
  response: RpcRS;
}
export type RpcEmit<
  PS extends RpcPS,
  RS extends RpcRS,
> = (
  ...args: z.input<PS>
) => Promise<z.output<RS>>

export type RpcRecv<PS extends RpcPS, RS extends RpcRS> = (...args: z.output<PS>) => Promise<z.input<RS>>

/**
 * @description 确保 rpcMethod的形式是 Record<string,RPCMethodItem> 但是又需要保留原始类型 因此使用泛型约束并返回原类型
 */
export const defineRpcMethod = <M extends Record<string, RPCMethodItem>>(
  methods: M,
): M => methods
