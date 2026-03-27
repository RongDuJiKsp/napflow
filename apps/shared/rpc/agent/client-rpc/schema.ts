import { ZodCheckWorkflowAppDraft } from '@shared/common/workflow/base'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { ZodCheckXYPosition } from '@shared/common/workflow/core/re-export'
import z from 'zod'

export const ZodClientRpcNullRequest = z.tuple([])
export const defineZodClientRpcResponse = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data: data.optional(),
    success: z.boolean(),
  })

// addCustomNode
export const ZodToolSchemaAddCustomNode = z.object({
  type: z.enum(ComponentNodesEnum),
  position: ZodCheckXYPosition,
})
export type ToolSchemaAddCustomNode = z.infer<
  typeof ZodToolSchemaAddCustomNode
>
export const ZodRpcAddCustomNodeRequest = z.tuple([ZodToolSchemaAddCustomNode])
export const ZodRpcAddCustomNodeResponse = defineZodClientRpcResponse(z.void())

// readCurrent
export const ZodRpcReadCurrentRequest = ZodClientRpcNullRequest
export const ZodRpcReadCurrentResponse = defineZodClientRpcResponse(
  ZodCheckWorkflowAppDraft.omit({ ofAppId: true }),
)
