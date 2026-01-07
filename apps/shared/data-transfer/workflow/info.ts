import z from 'zod'
import { ZodCheckWorkflowApp, ZodCheckWorkflowAppData, ZodCheckWorkflowAppPublish } from '../../common/workflow/base'
import { defineZodResp } from '../_base'

// @/workflow/create
export const ZodCheckCreateWorkflowReq = ZodCheckWorkflowApp.pick({ appName: true, appDescription: true })
export type CreateWorkflowReq = z.infer<typeof ZodCheckCreateWorkflowReq>

// @/workflow/:appId
export const ZodCheckGetAppResp = defineZodResp(ZodCheckWorkflowApp)
export type GetAppResp = z.infer<typeof ZodCheckGetAppResp>

// @/workflow/apps
export const ZodCheckGetAppsResp = defineZodResp(z.array(ZodCheckWorkflowApp))
export type GetAppsResp = z.infer<typeof ZodCheckGetAppsResp>

// @/workflow/:appId/draft
export const ZodCheckLoadDraftResp = defineZodResp(ZodCheckWorkflowAppData)
export type LoadDraftResp = z.infer<typeof ZodCheckLoadDraftResp>

// @/workflow/:appId/publish
export const ZodCheckWorkflowPublishReq = z.object({
  version: z.string(),
  description: z.string(),
})
export type WorkflowPublishReq = z.infer<typeof ZodCheckWorkflowPublishReq>

export const ZodCheckWorkflowPublishResp = defineZodResp(ZodCheckWorkflowAppPublish)
export type WorkflowPublishResp = z.infer<typeof ZodCheckWorkflowPublishResp>
