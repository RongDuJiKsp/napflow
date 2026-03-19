import z from 'zod'
import { ZodCheckWorkflowAppData } from './entity'

export const ZodCheckWorkflowAppDraft = ZodCheckWorkflowAppData.pick({
  ofAppId: true,
  nodes: true,
  edges: true,
  envs: true,
})
export type WorkflowAppDraft = z.infer<typeof ZodCheckWorkflowAppDraft>

export const ZodCheckWorkflowAppVersionMeta = ZodCheckWorkflowAppData.pick({
  version: true,
  publishDescription: true,
  publishAt: true,
  publishBy: true,
})
export type WorkflowAppVersionMeta = z.infer<
  typeof ZodCheckWorkflowAppVersionMeta
>

export const ZodCheckWorkflowAppVersionInfos
  = ZodCheckWorkflowAppVersionMeta.extend({ ofAppId: z.string() })
export type WorkflowAppVersionInfos = z.infer<
  typeof ZodCheckWorkflowAppVersionInfos
>
