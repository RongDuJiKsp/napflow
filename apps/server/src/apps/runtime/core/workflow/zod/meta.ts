import { ComponentNodesEnum, ZodCheckVar } from '@shared/common/workflow/core/component-node'
import z from 'zod'

export const ZodCheckComponentNodeMeta = z.object({
  type: z.enum(ComponentNodesEnum),
  vars: z.array(ZodCheckVar),
})
export type ComponentNodeMeta = z.infer<typeof ZodCheckComponentNodeMeta>
