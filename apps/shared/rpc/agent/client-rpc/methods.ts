import type { RpcEmit } from '@shared/rpc/core/ts-check'
import { defineRpcMethod } from '@shared/rpc/core/ts-check'
import {
  ZodRpcAddCustomNodeRequest,
  ZodRpcAddCustomNodeResponse,
  ZodRpcConnectNodeRequest,
  ZodRpcConnectNodeResponse,
  ZodRpcDeleteEdgeRequest,
  ZodRpcDeleteEdgeResponse,
  ZodRpcDeleteNodeRequest,
  ZodRpcDeleteNodeResponse,
  ZodRpcEditNodeDataRequest,
  ZodRpcEditNodeDataResponse,
  ZodRpcReadCurrentRequest,
  ZodRpcReadCurrentResponse,
} from './schema'

export const CLIENT_RPC_METHODS = defineRpcMethod({
  addCustomNode: {
    request: ZodRpcAddCustomNodeRequest,
    response: ZodRpcAddCustomNodeResponse,
  },
  connectNode: {
    request: ZodRpcConnectNodeRequest,
    response: ZodRpcConnectNodeResponse,
  },
  deleteEdge: {
    request: ZodRpcDeleteEdgeRequest,
    response: ZodRpcDeleteEdgeResponse,
  },
  deleteNode: {
    request: ZodRpcDeleteNodeRequest,
    response: ZodRpcDeleteNodeResponse,
  },
  editNodeData: {
    request: ZodRpcEditNodeDataRequest,
    response: ZodRpcEditNodeDataResponse,
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
