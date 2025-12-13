import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import { ZodBody } from '@/src/decorator/zod'
import { UserGroupTypes } from '@/src/prisma/generated/enums'
import {
  Controller,
  Get,
  Inject,
  Param,
  ParseBoolPipe,
  Post,
  Query,
} from '@nestjs/common'
import type { AccountType } from '@shared/data-transfer/account/base'
import type {
  CreateWorkflowReqType,
  GetAppRespType,
  GetAppsRespType,
  LoadDraftRespType,
} from '@shared/data-transfer/workflow/info'
import {
  CreateWorkflowReq,
  GetAppResp,
  GetAppsResp,
  LoadDraftResp,
} from '@shared/data-transfer/workflow/info'
import { WorkflowService } from './workflow.service'
import { ZodSerializerDto } from 'nestjs-zod'
import type { NullRespType } from '@shared/data-transfer/_base'
import { Code, NullResp, Resp } from '@shared/data-transfer/_base'
import { WorkflowDataService } from './workflow-data.service'
import { JwtBody } from '@/src/decorator/jwt'
import type { WorkflowAppDataType } from '@shared/data-transfer/workflow/base'
import { WorkflowAppData } from '@shared/data-transfer/workflow/base'
@Controller('workflow')
export class WorkflowController {
  constructor(
    @Inject(WorkflowService) private readonly workflowService: WorkflowService,
    @Inject(WorkflowDataService) private readonly workflowDataService: WorkflowDataService,
  ) {}

  @Post('create')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(NullResp)
  async createApp(
    @ZodBody({ zod: CreateWorkflowReq }) req: CreateWorkflowReqType,
    @JwtAccount() account: AccountType,
  ): Promise<NullRespType> {
    await this.workflowService.createApp(
      req.appName,
      req.appDescription,
      account,
    )
    return Resp.ok()
  }

  @Get('apps')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(GetAppsResp)
  async getMutiApp(
    @Query('onlySelf', new ParseBoolPipe({ optional: true })) onlySelf: boolean,
    @JwtAccount() account: AccountType,
  ): Promise<GetAppsRespType> {
    const app = await this.workflowService.getApps(
      onlySelf ? account.email : undefined,
    )
    return Resp.ok(app)
  }

  @Get(':appId')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(GetAppResp)
  async getSingleApp(@Param('appId') appId: string): Promise<GetAppRespType> {
    const app = await this.workflowService.getApp(appId)
    if (!app) return Resp.error('App Not Found', Code.NotFound)

    return Resp.ok(app)
  }

  @Get(':appId/draft')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(LoadDraftResp)
  async loadDraft(@Param('appId') appId: string): Promise<LoadDraftRespType> {
    const app = await this.workflowDataService.loadDraft(appId)
    if (!app) return Resp.error('App Not Found', Code.NotFound)
    return Resp.ok(app)
  }

  @Post(':appId/sync')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(NullResp)
  async syncDraft(@Param('appId') appId: string, @JwtBody({ zod: WorkflowAppData }) data: WorkflowAppDataType): Promise<NullRespType> {
    await this.workflowDataService.syncDraft(appId, data)
    return Resp.ok()
  }
}
