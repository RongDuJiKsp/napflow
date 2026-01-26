import z from 'zod'
import { ZodCheckWorkflowApp, ZodCheckWorkflowAppData, ZodCheckWorkflowAppDraft } from '../../common/workflow/base'
import { defineZodResp } from '../_base'

// @/workflow/create
export const ZodCheckCreateWorkflowReq = ZodCheckWorkflowApp.pick({ appName: true, appDescription: true })
export type CreateWorkflowReq = z.infer<typeof ZodCheckCreateWorkflowReq>
export const ZodCheckCreateWorkflowResp = defineZodResp(z.object({
  appId: z.string(),
}))
export type CreateWorkflowResp = z.infer<typeof ZodCheckCreateWorkflowResp>

// @/workflow/:appId
export const ZodCheckGetAppResp = defineZodResp(ZodCheckWorkflowApp)
export type GetAppResp = z.infer<typeof ZodCheckGetAppResp>

// @/workflow/apps
export const ZodCheckGetAppsResp = defineZodResp(z.array(ZodCheckWorkflowApp))
export type GetAppsResp = z.infer<typeof ZodCheckGetAppsResp>

// @/workflow/:appId/draft
export const ZodCheckLoadDraftResp = defineZodResp(ZodCheckWorkflowAppDraft)
export type LoadDraftResp = z.infer<typeof ZodCheckLoadDraftResp>

// @/workflow/:appId/versions
export const ZodCheckGetVersionsResp = defineZodResp(z.array(ZodCheckWorkflowAppData))
export type GetVersionsResp = z.infer<typeof ZodCheckGetVersionsResp>

// @/workflow/:appId/publish
export const ZodCheckWorkflowPublishReq = z.object({
  version: z.string(),
  description: z.string(),
})
export type WorkflowPublishReq = z.infer<typeof ZodCheckWorkflowPublishReq>
export const ZodCheckWorkflowPublishResp = defineZodResp(ZodCheckWorkflowAppData)
export type WorkflowPublishResp = z.infer<typeof ZodCheckWorkflowPublishResp>
