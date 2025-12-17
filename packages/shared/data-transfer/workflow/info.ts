import z from 'zod'
import { WorkflowApp, WorkflowAppData, WorkflowAppPublish } from './base'
import { defineZodResp } from '../_base'

// @/workflow/create
export const CreateWorkflowReq = WorkflowApp.pick({ appName: true, appDescription: true })
export type CreateWorkflowReqType = z.infer<typeof CreateWorkflowReq>

// @/workflow/:appId
export const GetAppResp = defineZodResp(WorkflowApp)
export type GetAppRespType = z.infer<typeof GetAppResp>

// @/workflow/apps
export const GetAppsResp = defineZodResp(z.array(WorkflowApp))
export type GetAppsRespType = z.infer<typeof GetAppsResp>

// @/workflow/:appId/draft
export const LoadDraftResp = defineZodResp(WorkflowAppData)
export type LoadDraftRespType = z.infer<typeof LoadDraftResp>

// @/workflow/:appId/publish
export const WorkflowPublishReq = z.object({
  version: z.string(),
  description: z.string(),
})
export type WorkflowPublishReqType = z.infer<typeof WorkflowPublishReq>
export const WorkflowPublishResp = defineZodResp(WorkflowAppPublish)
export type WorkflowPublishRespType = z.infer<typeof WorkflowPublishResp>
