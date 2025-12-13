import z from 'zod'

export const WorkflowApp = z.object({
  appId: z.uuidv4(),
  appName: z.string(),
  appDescription: z.string(),
})

export const WorkflowAppData = WorkflowApp.extend({})
