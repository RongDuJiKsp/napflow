import { ZodCheckWorkflowAppDraft } from '@shared/common/workflow/base'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { ZodCheckXYPosition } from '@shared/common/workflow/core/re-export'
import z from 'zod'

export const ZodClientRpcNullRequest = z.tuple([])
export const ZodClientRpcBaseResponse = z.object({
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
export const ZodRpcAddCustomNodeResponse = ZodClientRpcBaseResponse

// readCurrent
export const ZodRpcReadCurrentRequest = ZodClientRpcNullRequest
export const ZodRpcReadCurrentResponse = ZodClientRpcBaseResponse.extend({
  data: ZodCheckWorkflowAppDraft.omit({ ofAppId: true }),
})
