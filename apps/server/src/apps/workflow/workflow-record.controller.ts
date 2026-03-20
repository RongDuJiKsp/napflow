import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import { ZodBody } from '@/src/decorator/zod'
import { Controller, Get, Inject, Param, ParseBoolPipe, Post, Query } from '@nestjs/common'
import type { Account } from '@shared/common/account/base'
import { UserRole } from '@shared/common/account/core'
import type { CreateWorkflowReq, UpdateWorkflowReq } from '@shared/data-transfer/workflow/info'
import {
  ZodCheckCreateWorkflowReq,
  ZodCheckCreateWorkflowResp,
  ZodCheckGetAppResp,
  ZodCheckGetAppsResp,
  ZodCheckUpdateWorkflowReq,
  ZodCheckUpdateWorkflowResp,
} from '@shared/data-transfer/workflow/info'
import { WorkflowService } from './workflow.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { Code, Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'

@Controller('workflow/record')
export class WorkflowRecordController {
  constructor(
    @Inject(WorkflowService) private readonly workflowService: WorkflowService,
  ) {}

  @Post('create')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckCreateWorkflowResp)
  async createApp(
    @ZodBody({ zod: ZodCheckCreateWorkflowReq }) req: CreateWorkflowReq,
    @JwtAccount() account: Account,
  ) {
    const app = await this.workflowService.createApp(
      req.appName,
      req.appDescription,
      account,
    )
    return Resp.ok({
      appId: app.appId,
    })
  }

  @Get('list')
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

  @Post(':appId/update')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckUpdateWorkflowResp)
  async updateApp(
    @Param('appId') appId: string,
    @ZodBody({ zod: ZodCheckUpdateWorkflowReq }) req: UpdateWorkflowReq,
  ) {
    const app = await this.workflowService.updateApp(
      appId,
      req.appName,
      req.appDescription,
    )
    if (!app) return Resp.error('App Not Found', Code.NotFound)
    return Resp.ok(app)
  }

  @Post(':appId/delete')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async deleteApp(@Param('appId') appId: string) {
    const result = await this.workflowService.deleteApp(appId)
    if (!result.affected) return Resp.error('App Not Found', Code.NotFound)
    return Resp.ok()
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
