import type z from 'zod'
export type RPCMethodItem = {
  request: z.ZodTuple<any, any>;
  response: z.ZodTypeAny;
}
/**
 * @description 确保 rpcMethod的形式是 Record<string,RPCMethodItem> 但是又需要保留原始类型 因此使用泛型约束并返回原类型
 */
export const defineRpcMethod = <M extends Record<string, RPCMethodItem>>(
  methods: M,
): M => methods
