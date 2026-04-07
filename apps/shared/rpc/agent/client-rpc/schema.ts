import { ZodCheckWorkflowAppDraft } from '@shared/common/workflow/base'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { ZodCheckXYPosition } from '@shared/common/workflow/core/re-export'
import z from 'zod'

export const ZodClientRpcNullRequest = z.tuple([])
export const defineZodClientRpcRequest = <T extends z.ZodTypeAny>(data: T) => z.tuple([data])
export const defineZodClientRpcResponse = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data: data.optional(),
    success: z.boolean(),
    errMsg: z.string().optional(),
  })

// addCustomNode
export const ZodToolSchemaAddCustomNode = z.object({
  type: z.enum(ComponentNodesEnum),
  position: ZodCheckXYPosition,
})
export type ToolSchemaAddCustomNode = z.infer<
  typeof ZodToolSchemaAddCustomNode
>
export const ZodRpcAddCustomNodeRequest = defineZodClientRpcRequest(ZodToolSchemaAddCustomNode)
export const ZodRpcAddCustomNodeResponse = defineZodClientRpcResponse(z.void())

// connectNode
export const ZodRpcConnectNodeRequest = defineZodClientRpcRequest(z.object({
  source: z.string(),
  sourceHandle: z.string().nullable(),
  target: z.string(),
  targetHandle: z.string().nullable(),
}))
export const ZodRpcConnectNodeResponse = defineZodClientRpcResponse(z.void())

// readCurrent
export const ZodRpcReadCurrentRequest = ZodClientRpcNullRequest
export const ZodRpcReadCurrentResponse = defineZodClientRpcResponse(
  ZodCheckWorkflowAppDraft.omit({ ofAppId: true }),
)
