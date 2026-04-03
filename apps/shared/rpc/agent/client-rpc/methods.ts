import type { RpcEmit } from '@shared/rpc/core/ts-check'
import { defineRpcMethod } from '@shared/rpc/core/ts-check'
import {
  ZodRpcAddCustomNodeRequest,
  ZodRpcAddCustomNodeResponse,
  ZodRpcReadCurrentRequest,
  ZodRpcReadCurrentResponse,
} from './schema'

export const CLIENT_RPC_METHODS = defineRpcMethod({
  addCustomNode: {
    request: ZodRpcAddCustomNodeRequest,
    response: ZodRpcAddCustomNodeResponse,
  },
  readCurrent: {
    request: ZodRpcReadCurrentRequest,
    response: ZodRpcReadCurrentResponse,
  },
})

export type ClientRPCMethods = typeof CLIENT_RPC_METHODS

export type ClientRPCHandler<K extends keyof ClientRPCMethods> = RpcEmit<
  ClientRPCMethods[K]['request'],
  ClientRPCMethods[K]['response']
>
