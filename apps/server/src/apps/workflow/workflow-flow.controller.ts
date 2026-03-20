import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import { ZodBody } from '@/src/decorator/zod'
import { Controller, Get, Inject, Param, Post } from '@nestjs/common'
import type { Account } from '@shared/common/account/base'
import { UserRole } from '@shared/common/account/core'
import type { WorkflowPublishReq } from '@shared/data-transfer/workflow/info'
import {
  ZodCheckLoadDraftResp,
  ZodCheckWorkflowPublishReq,
  ZodCheckWorkflowPublishResp,
} from '@shared/data-transfer/workflow/info'
import { ZodSerializerDto } from 'nestjs-zod'
import { Code, Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import { WorkflowDataService } from './workflow-data.service'
import type { WorkflowAppDraft } from '@shared/common/workflow/base'
import { ZodCheckWorkflowAppDraft } from '@shared/common/workflow/base'

@Controller('workflow/flow')
export class WorkflowFlowController {
  constructor(
    @Inject(WorkflowDataService)
    private readonly workflowDataService: WorkflowDataService,
  ) {}

  @Get(':appId/draft')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckLoadDraftResp)
  async loadDraft(@Param('appId') appId: string) {
    const app = await this.workflowDataService.loadDraft(appId)
    if (!app) return Resp.error('App Not Found', Code.NotFound)
    return Resp.ok(app)
  }

  @Post(':appId/sync')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async syncDraft(
    @Param('appId') appId: string,
    @ZodBody({ zod: ZodCheckWorkflowAppDraft }) data: WorkflowAppDraft,
  ) {
    await this.workflowDataService.syncDraft(appId, data)
    return Resp.ok()
  }

  @Post(':appId/publish')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckWorkflowPublishResp)
  async publishDraft(
    @Param('appId') appId: string,
    @JwtAccount() account: Account,
    @ZodBody({ zod: ZodCheckWorkflowPublishReq }) data: WorkflowPublishReq,
  ) {
    const publishMeta = await this.workflowDataService.publishDraft(
      appId,
      data.version,
      data.description,
      account,
    )
    if (!publishMeta)
      return Resp.error('Publish Failed: 版本已存在', Code.BadRequest)
    return Resp.ok(publishMeta)
  }
}
