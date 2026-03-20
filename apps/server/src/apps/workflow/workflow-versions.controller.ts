import { AllowUserGroup } from '@/src/decorator/account'
import { Controller, Get, Inject, Param } from '@nestjs/common'
import { UserRole } from '@shared/common/account/core'
import {
  ZodCheckGetLastVersionResp,
  ZodCheckGetVersionMetaResp,
  ZodCheckGetVersionResp,
  ZodCheckGetVersionsResp,
} from '@shared/data-transfer/workflow/info'
import { ZodSerializerDto } from 'nestjs-zod'
import { Code, Resp } from '@shared/data-transfer/_base'
import { WorkflowDataService } from './workflow-data.service'

@Controller('workflow/versions')
export class WorkflowVersionsController {
  constructor(
    @Inject(WorkflowDataService)
    private readonly workflowDataService: WorkflowDataService,
  ) {}

  @Get(':appId/list')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckGetVersionsResp)
  async getVersions(@Param('appId') appId: string) {
    const versions = await this.workflowDataService.getDatas(appId)
    return Resp.ok(versions)
  }

  @Get(':appId/:version/query')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckGetVersionResp)
  async getVersionData(
    @Param('appId') appId: string,
    @Param('version') version: string,
  ) {
    const data = await this.workflowDataService.findData(appId, version)
    if (!data) return Resp.error('App Version Not Found', Code.NotFound)
    return Resp.ok(data)
  }

  @Get(':appId/:version/meta')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckGetVersionMetaResp)
  async getVersionMeta(
    @Param('appId') appId: string,
    @Param('version') version: string,
  ) {
    const data = await this.workflowDataService.findData(appId, version)
    if (!data)
      return Resp.error('App Version Not Found,No Meta', Code.NotFound)
    return Resp.ok(data)
  }

  @Get(':appId/last')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckGetLastVersionResp)
  async getLastVersion(@Param('appId') appId: string) {
    const data = await this.workflowDataService.getLastestPublish(appId)
    if (!data) return Resp.error('App Version Not Found', Code.NotFound)
    return Resp.ok(data)
  }
}
