import z from 'zod'

export const WorkflowAppData = z.object({})
export type WorkflowAppDataType = z.infer<typeof WorkflowAppData>

export const WorkflowApp = z.object({
  appId: z.uuidv4(),
  appName: z.string(),
  appDescription: z.string(),
  extraData: WorkflowAppData.nullable(),
})
export type WorkflowAppType = z.infer<typeof WorkflowApp>
