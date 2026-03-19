import z from 'zod'
import {
  ZodCheckWorkflowAppDraft,
  ZodCheckWorkflowAppVersionMeta,
} from '../../common/workflow/base'
import {
  ZodCheckWorkflowApp,
  ZodCheckWorkflowAppData,
} from '../../common/workflow/entity'
import { defineZodResp } from '../_base'

// @/workflow/create
export const ZodCheckCreateWorkflowReq = ZodCheckWorkflowApp.pick({
  appName: true,
  appDescription: true,
})
export type CreateWorkflowReq = z.infer<typeof ZodCheckCreateWorkflowReq>
export const ZodCheckCreateWorkflowResp = defineZodResp(
  z.object({
    appId: z.string(),
  }),
)
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
export const ZodCheckGetVersionsResp = defineZodResp(
  z.array(ZodCheckWorkflowAppData),
)
export type GetVersionsResp = z.infer<typeof ZodCheckGetVersionsResp>

// @/workflow/:appId/version/:version
export const ZodCheckGetVersionResp = defineZodResp(ZodCheckWorkflowAppData)
export type GetVersionResp = z.infer<typeof ZodCheckGetVersionResp>

// @/workflow/:appId/version-meta
export const ZodCheckGetVersionMetaResp = defineZodResp(
  ZodCheckWorkflowAppVersionMeta,
)
export type GetVersionMetaResp = z.infer<typeof ZodCheckGetVersionMetaResp>

// @/workflow/:appId/last-version
export const ZodCheckGetLastVersionResp = defineZodResp(
  ZodCheckWorkflowAppData,
)
export type GetLastVersionResp = z.infer<typeof ZodCheckGetLastVersionResp>

// @/workflow/:appId/publish
export const ZodCheckWorkflowPublishReq = z.object({
  version: z.string().min(1).max(30),
  description: z.string().min(1).max(50),
})
export type WorkflowPublishReq = z.infer<typeof ZodCheckWorkflowPublishReq>
export const ZodCheckWorkflowPublishResp = defineZodResp(
  ZodCheckWorkflowAppData,
)
export type WorkflowPublishResp = z.infer<typeof ZodCheckWorkflowPublishResp>

// @/workflow/:appId/update
export const ZodCheckUpdateWorkflowReq = z.object({
  appName: z.string().min(1).max(20),
  appDescription: z.string().min(1).max(50),
})
export type UpdateWorkflowReq = z.infer<typeof ZodCheckUpdateWorkflowReq>
export const ZodCheckUpdateWorkflowResp = defineZodResp(ZodCheckWorkflowApp)
export type UpdateWorkflowResp = z.infer<typeof ZodCheckUpdateWorkflowResp>
