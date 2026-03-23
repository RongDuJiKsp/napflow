import type z from 'zod'

/**
 * @description 确保 rpcMethod的形式是 Record<string, { request: z.ZodTuple<any, any>; response: z.ZodTypeAny }> 但是又需要保留原始类型 因此使用泛型约束并返回原类型
 */
export const defineRpcMethod = <M extends Record<string, { request: z.ZodTuple<any, any>; response: z.ZodTypeAny }>>(methods: M): M => methods
