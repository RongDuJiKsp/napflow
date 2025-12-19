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
import { type AccountType, UserRole } from '@shared/data-transfer/account/base'
import type {
  CreateWorkflowReqType,
  WorkflowPublishReqType,
} from '@shared/data-transfer/workflow/info'
import {
  CreateWorkflowReq,
  GetAppResp,
  GetAppsResp,
  LoadDraftResp,
  WorkflowPublishReq,
  WorkflowPublishResp,
} from '@shared/data-transfer/workflow/info'
import { WorkflowService } from './workflow.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { Code, NullResp, Resp } from '@shared/data-transfer/_base'
import { WorkflowDataService } from './workflow-data.service'
import type { WorkflowAppDataType } from '@shared/data-transfer/workflow/base'
import { WorkflowAppData } from '@shared/data-transfer/workflow/base'
@Controller('workflow')
export class WorkflowController {
  constructor(
    @Inject(WorkflowService) private readonly workflowService: WorkflowService,
    @Inject(WorkflowDataService)
    private readonly workflowDataService: WorkflowDataService,
  ) {}

  @Post('create')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(NullResp)
  async createApp(
    @ZodBody({ zod: CreateWorkflowReq }) req: CreateWorkflowReqType,
    @JwtAccount() account: AccountType,
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
  @ZodSerializerDto(GetAppsResp)
  async getMutiApp(
    @Query('onlySelf', new ParseBoolPipe({ optional: true })) onlySelf: boolean,
    @JwtAccount() account: AccountType,
  ) {
    const app = await this.workflowService.getApps(
      onlySelf ? account.email : undefined,
    )
    return Resp.ok(app)
  }

  @Get(':appId/draft')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(LoadDraftResp)
  async loadDraft(@Param('appId') appId: string) {
    const app = await this.workflowDataService.loadDraft(appId)
    if (!app) return Resp.error('App Not Found', Code.NotFound)
    return Resp.ok(app)
  }

  @Post(':appId/sync')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(NullResp)
  async syncDraft(
    @Param('appId') appId: string,
    @ZodBody({ zod: WorkflowAppData }) data: WorkflowAppDataType,
  ) {
    await this.workflowDataService.syncDraft(appId, data)
    return Resp.ok()
  }

  @Post(':appId/publish')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(WorkflowPublishResp)
  async publishDraft(
    @Param('appId') appId: string,
    @ZodBody({ zod: WorkflowPublishReq }) data: WorkflowPublishReqType,
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
  @ZodSerializerDto(GetAppResp)
  async getSingleApp(@Param('appId') appId: string) {
    const app = await this.workflowService.getApp(appId)
    if (!app) return Resp.error('App Not Found', Code.NotFound)

    return Resp.ok(app)
  }
}
