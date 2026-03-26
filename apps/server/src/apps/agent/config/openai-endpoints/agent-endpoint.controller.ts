import { ZodBody } from '@/src/decorator/zod'
import { Controller, Get, Inject, Param, Post } from '@nestjs/common'
import { UserRole } from '@shared/common/account/core'
import { Code, Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import type {
  CreateOpenAiEndpointReq,
  UpdateOpenAiEndpointReq,
} from '@shared/data-transfer/agent/endpoint'
import {
  ZodCheckCreateOpenAiEndpointReq,
  ZodCheckCreateOpenAiEndpointResp,
  ZodCheckGetOpenAiEndpointListResp,
  ZodCheckUpdateOpenAiEndpointReq,
} from '@shared/data-transfer/agent/endpoint'
import { ZodSerializerDto } from 'nestjs-zod'
import { AllowUserGroup } from '@/src/decorator/account'
import { AgentEndpointService } from './agent-endpoint.service'

@Controller('agent/openai-endpoint')
export class AgentEndpointController {
  constructor(
    @Inject(AgentEndpointService)
    private readonly agentService: AgentEndpointService,
  ) {}

  @Get()
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckGetOpenAiEndpointListResp)
  async getOpenAiEndpointList() {
    const configs = await this.agentService.getOpenAiEndpointListToShow()
    return Resp.ok(configs)
  }

  @Post('create')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckCreateOpenAiEndpointResp)
  async createOpenAiEndpoint(
    @ZodBody({ zod: ZodCheckCreateOpenAiEndpointReq })
    req: CreateOpenAiEndpointReq,
  ) {
    const created = await this.agentService.createOpenAiEndpoint(req)
    return Resp.ok({ id: created.id })
  }

  @Post(':id/update')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async updateOpenAiEndpoint(
    @Param('id') id: string,
    @ZodBody({ zod: ZodCheckUpdateOpenAiEndpointReq })
    req: UpdateOpenAiEndpointReq,
  ) {
    const updated = await this.agentService.updateOpenAiEndpoint(id, req)
    if (!updated) return Resp.error('配置不存在或已被删除', Code.NotFound)

    return Resp.ok()
  }

  @Post(':id/delete')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async deleteOpenAiEndpoint(@Param('id') id: string) {
    const result = await this.agentService.deleteOpenAiEndpoint(id)
    if (!result.affected)
      return Resp.error('配置不存在或已被删除', Code.NotFound)

    return Resp.ok()
  }
}
