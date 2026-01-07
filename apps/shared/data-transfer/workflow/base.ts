import z from 'zod'
import { ZodCheckEdge, ZodCheckNode } from './_import'

export enum NodeClassic {
  Component = 'component', // 组件节点,该节点作为工作流运行路径的组成部分
  Note = 'note', // 注释节点,该节点置于组件节点之下但不跟随拖动，用于说明一部分节点 or 一块区域
}

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
