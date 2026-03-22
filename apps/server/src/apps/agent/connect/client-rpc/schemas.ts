import { ZodCheckWorkflowAppDraft } from '@shared/common/workflow/base'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { ZodCheckXYPosition } from '@shared/common/workflow/core/re-export'
import z from 'zod'
// base
const ZodRpcNullRequest = z.tuple([])
const ZodRpcBaseResponse = z.object({
  success: z.boolean(),
})

// addCustomNode
export const ZodRpcAddCustomNodeRequest = z.tuple([
  z.enum(ComponentNodesEnum),
  ZodCheckXYPosition,
])
export const ZodRpcAddCustomNodeResponse = ZodRpcBaseResponse

// readCurrent
export const ZodRpcReadCurrentRequest = ZodRpcNullRequest
export const ZodRpcReadCurrentResponse = ZodRpcBaseResponse.extend({
  data: ZodCheckWorkflowAppDraft.omit({ ofAppId: true }),
})
