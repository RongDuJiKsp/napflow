import { ZodCheckWorkflowAppDraft } from '@shared/common/workflow/base'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { ZodCheckXYPosition } from '@shared/common/workflow/core/re-export'
import { ZodRpcBaseResponse, ZodRpcNullRequest } from '@shared/rpc/core/base-schema'
import z from 'zod'

// addCustomNode
export const ZodToolSchemaAddCustomNode = z.object({
  type: z.enum(ComponentNodesEnum),
  position: ZodCheckXYPosition,
})
export type ToolSchemaAddCustomNode = z.infer<typeof ZodToolSchemaAddCustomNode>
export const ZodRpcAddCustomNodeRequest = z.tuple([
  ZodToolSchemaAddCustomNode,
])
export const ZodRpcAddCustomNodeResponse = ZodRpcBaseResponse

// readCurrent
export const ZodRpcReadCurrentRequest = ZodRpcNullRequest
export const ZodRpcReadCurrentResponse = ZodRpcBaseResponse.extend({
  data: ZodCheckWorkflowAppDraft.omit({ ofAppId: true }),
})
