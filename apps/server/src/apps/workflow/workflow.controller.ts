import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import { ZodBody } from '@/src/decorator/zod'
import {
  Controller,
  Get,
  Inject,
  Param,
  ParseBoolPipe,
  Post,
  Query,
} from '@nestjs/common'
import { type Account, UserRole } from '@shared/common/account/base'
import type {
  CreateWorkflowReq,
  WorkflowPublishReq,
} from '@shared/data-transfer/workflow/info'
import {
  ZodCheckCreateWorkflowReq,
  ZodCheckGetAppResp,
  ZodCheckGetAppsResp,
  ZodCheckLoadDraftResp,
  ZodCheckWorkflowPublishReq,
  ZodCheckWorkflowPublishResp,
} from '@shared/data-transfer/workflow/info'
import { WorkflowService } from './workflow.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { Code, Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import { WorkflowDataService } from './workflow-data.service'
import type { WorkflowAppData } from '@shared/common/workflow/base'
import { ZodCheckWorkflowAppData } from '@shared/common/workflow/base'
@Controller('workflow')
export class WorkflowController {
  constructor(
    @Inject(WorkflowService) private readonly workflowService: WorkflowService,
    @Inject(WorkflowDataService)
    private readonly workflowDataService: WorkflowDataService,
  ) {}

  @Post('create')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async createApp(
    @ZodBody({ zod: ZodCheckCreateWorkflowReq }) req: CreateWorkflowReq,
    @JwtAccount() account: Account,
  ) {
    await this.workflowService.createApp(
      req.appName,
      req.appDescription,
      account,
    )
    return Resp.ok()
  }

  @Get('apps')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckGetAppsResp)
  async getMutiApp(
    @Query('onlySelf', new ParseBoolPipe({ optional: true })) onlySelf: boolean,
    @JwtAccount() account: Account,
  ) {
    const app = await this.workflowService.getApps(
      onlySelf ? account.email : undefined,
    )
    return Resp.ok(app)
  }

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
    @ZodBody({ zod: ZodCheckWorkflowAppData }) data: WorkflowAppData,
  ) {
    await this.workflowDataService.syncDraft(appId, data)
    return Resp.ok()
  }

  @Post(':appId/publish')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckWorkflowPublishResp)
  async publishDraft(
    @Param('appId') appId: string,
    @ZodBody({ zod: ZodCheckWorkflowPublishReq }) data: WorkflowPublishReq,
  ) {
    const publishMeta = await this.workflowDataService.publishDraft(
      appId,
      data.version,
      data.description,
    )
    if (!publishMeta)
      return Resp.error('Publish Failed: 版本已存在', Code.BadRequest)
    return Resp.ok(publishMeta)
  }

  @Get(':appId')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckGetAppResp)
  async getSingleApp(@Param('appId') appId: string) {
    const app = await this.workflowService.getApp(appId)
    if (!app) return Resp.error('App Not Found', Code.NotFound)

    return Resp.ok(app)
  }
}
