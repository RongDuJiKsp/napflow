import z from 'zod'
import { ZodCheckEdge, ZodCheckNode } from './core'

export const ZodCheckWorkflowApp = z.object({
  appId: z.uuidv4(),
  appName: z.string(),
  appDescription: z.string(),
  createdAt: z.date(),
  createdBy: z.string(),
})
export type WorkflowApp = z.infer<typeof ZodCheckWorkflowApp>

export const ZodCheckWorkflowAppData = z.object({
  version: z.string(),
  ofAppId: z.string(),
  publishDescription: z.string().nullable(),
  publishAt: z.date().nullable(),
  publishBy: z.string().nullable(),
  lastUpdateAt: z.date(),

  nodes: z.array(
    ZodCheckNode,
  ).nullable(),
  edges: z.array(
    ZodCheckEdge,
  ).nullable(),
})
export type WorkflowAppData = z.infer<typeof ZodCheckWorkflowAppData>

export const ZodCheckWorkflowAppDraft = ZodCheckWorkflowAppData.pick({
  ofAppId: true,
  nodes: true,
  edges: true,
})
export type WorkflowAppDraft = z.infer<typeof ZodCheckWorkflowAppDraft>
