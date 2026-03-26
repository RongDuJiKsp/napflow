import { AllowUserGroup } from '@/src/decorator/account'
import { Controller, Get, Inject, Param } from '@nestjs/common'
import { UserRole } from '@shared/common/account/core'
import { Resp } from '@shared/data-transfer/_base'
import { ZodCheckGetRecoverableAgentSessionListResp } from '@shared/data-transfer/agent/session'
import { ZodSerializerDto } from 'nestjs-zod'
import { AgentSessionRecoverService } from './agent-session-recover.service'

@Controller('agent/session/recover/:appId')
export class AgentSessionRecoverController {
  constructor(
    @Inject(AgentSessionRecoverService)
    private readonly sessionRecoverService: AgentSessionRecoverService,
  ) {}

  @Get('list')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckGetRecoverableAgentSessionListResp)
  getRecoverSessionList(@Param('appId') appId: string) {
    return Resp.ok(this.sessionRecoverService.getRecoverableSessionList(appId))
  }
}
