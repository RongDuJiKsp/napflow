import z from 'zod'
import { ZodCheckEdge, ZodCheckNode } from './core'
import { ZodCheckVar } from './component-node'

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
  envs: z.array(
    ZodCheckVar,
  ).nullable(),
})
export type WorkflowAppData = z.infer<typeof ZodCheckWorkflowAppData>

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
export type WorkflowAppVersionMeta = z.infer<typeof ZodCheckWorkflowAppVersionMeta>

export const ZodCheckWorkflowAppVersionInfos = ZodCheckWorkflowAppVersionMeta.extend({ ofAppId: z.string() })
export type WorkflowAppVersionInfos = z.infer<typeof ZodCheckWorkflowAppVersionInfos>
