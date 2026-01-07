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

export const ZodCheckWorkflowAppPublish = z.object({
  version: z.string(),
  description: z.string().nullable(),
  publishAt: z.date(),
  publishBy: z.string().nullable(),
})
export type WorkflowAppPublish = z.infer<typeof ZodCheckWorkflowAppPublish>

export const ZodCheckWorkflowAppData = z.object({
  dataId: z.string(),
  nodes: z.array(
    ZodCheckNode,
  ).nullable(),
  edges: z.array(
    ZodCheckEdge,
  ).nullable(),
})
export type WorkflowAppData = z.infer<typeof ZodCheckWorkflowAppData>
