import type z from 'zod'
import type {
  ClientRPCHandler,
  ClientRPCMethods,
} from '../connect/client-rpc/client-rpc'
import { tool } from 'langchain'
import { CLIENT_RPC_METHODS } from '@shared/rpc/agent/client-rpc/methods'

type ToolMeta = Omit<Parameters<typeof tool>[1], 'name' | 'schema'>

export const genToolFromClientRPCMethodItem = <
  K extends keyof ClientRPCMethods,
>(
  method: K,
  handler: ClientRPCHandler<K>,
  meta: ToolMeta,
) => {
  return tool(
    async (params: z.input<ClientRPCMethods[K]['request']>) => {
      return JSON.stringify(await handler(...params))
    },
    {
      ...meta,
      name: method,
      schema:
        CLIENT_RPC_METHODS[method as keyof typeof CLIENT_RPC_METHODS].request
          .def.items[0],
    },
  )
}
