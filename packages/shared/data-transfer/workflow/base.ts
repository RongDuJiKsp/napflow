import z from 'zod'

export const WorkflowApp = z.object({
  appId: z.uuidv4(),
  appName: z.string(),
  appDescription: z.string(),
  createdAt: z.date(),
  createdBy: z.string(),
})
export type WorkflowAppType = z.infer<typeof WorkflowApp>

export const WorkflowAppData = z.object({
  dataId: z.string(),
})
export type WorkflowAppDataType = z.infer<typeof WorkflowAppData>
