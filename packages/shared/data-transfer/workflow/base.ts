import z from 'zod'
import { Edge, Node } from './_import'
export const WorkflowApp = z.object({
  appId: z.uuidv4(),
  appName: z.string(),
  appDescription: z.string(),
  createdAt: z.date(),
  createdBy: z.string(),
})
export type WorkflowAppType = z.infer<typeof WorkflowApp>

export const WorkflowAppPublish = z.object({
  version: z.string(),
  description: z.string().nullable(),
  publishAt: z.date(),
  publishBy: z.string().nullable(),
})
export type WorkflowAppPublishType = z.infer<typeof WorkflowAppPublish>

export const WorkflowAppData = z.object({
  dataId: z.string(),
  nodes: z.array(
    Node,
  ).nullable(),
  edges: z.array(
    Edge,
  ).nullable(),
})
export type WorkflowAppDataType = z.infer<typeof WorkflowAppData>
