import type z from 'zod'
import { WorkflowApp } from './base'

// @/workflow/create
export const CreateWorkflowReq = WorkflowApp.pick({ appName: true, appDescription: true })
export type CreateWorkflowReqType = z.infer<typeof CreateWorkflowReq>
