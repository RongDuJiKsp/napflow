import { type ClientTool, tool } from '@langchain/core/tools'
import type { WorkflowEditorClientRPC } from '../client-rpc/client-rpc'
import {
  CLIENT_RPC_METHODS,
  type ClientRPCMethods,
} from '@shared/rpc/agent/client-rpc/methods'
import z from 'zod'
import { Logger } from '@nestjs/common'

export const ClientRpcToolCallSchema = z
  .object({
    method: z.enum(
      Object.keys(CLIENT_RPC_METHODS) as (keyof ClientRPCMethods)[],
    ),
    args: z.array(z.unknown()),
  })
  .superRefine((data, ctx) => {
    const argsSchema = CLIENT_RPC_METHODS[data.method].request
    const parseResult = argsSchema.safeParse(data.args)
    if (!parseResult.success) {
      ctx.addIssue({
        code: 'custom',
        message: `Invalid arguments for method ${data.method}: ${z.prettifyError(parseResult.error)}`,
        fatal: true,
      })
    }
  })

export class AgentRPCTool {
  private readonly logger = new Logger(AgentRPCTool.name)
  // tools
  readonly findRpcMethods: ClientTool
  readonly invokeRpcMethod: ClientTool

  private readonly methodDescriptions: Record<keyof ClientRPCMethods, string>
    = {
      addCustomNode:
        'Add a custom node to the workflow editor with specified type and position.',
      connectNode:
        'Connect two nodes in the workflow editor with specified source, target, and their handles(if needed).',
      readCurrent:
        'Read the current state of the workflow editor, including nodes, edges, and environment variables.',
    }

  constructor(private readonly rpc: WorkflowEditorClientRPC) {
    this.findRpcMethods = tool(
      () => {
        this.logger.debug('Finding available RPC methods from the client')
        const methods = this.rpc.methodsList
        return JSON.stringify(
          methods.map(method => ({
            name: method,
            description: this.methodDescriptions[method],
            argsSchema: z.toJSONSchema(CLIENT_RPC_METHODS[method].request),
          })),
        )
      },
      {
        name: 'findRpcMethods',
        description:
          'Find available RPC methods from the client. No parameters needed.',
      },
    )
    this.invokeRpcMethod = tool(
      async ({ method, args }: z.output<typeof ClientRpcToolCallSchema>) => {
        this.logger.debug(
          `Invoking RPC method ${method} with arguments: ${JSON.stringify(args)}`,
        )
        const callArgs = args as z.output<
          ClientRPCMethods[typeof method]['request']
        >
        const handler = this.rpc.getHandler(method)
        return JSON.stringify(await handler(...callArgs))
      },
      {
        name: 'invokeRpcMethod',
        description:
          'Invoke a specific RPC method on the client with the provided arguments.',
        schema: ClientRpcToolCallSchema,
      },
    )
  }

  get Tools(): ClientTool[] {
    return [this.findRpcMethods, this.invokeRpcMethod]
  }
}
