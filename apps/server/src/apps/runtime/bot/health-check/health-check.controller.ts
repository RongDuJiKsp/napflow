import { AllowUserGroup } from '@/src/decorator/account'
import { Controller, Get, Inject, Param } from '@nestjs/common'
import { UserRole } from '@shared/common/account/base'
import { ZodSerializerDto } from 'nestjs-zod'
import { ZodCheckBotHealthSamplesResp }from '@shared/data-transfer/bot/health-check'
import { Resp } from '@shared/data-transfer/_base'
import { BotHealthCheckService } from './health-check.service'
@Controller('bot-health-check')
export class HealthCheckController {
  constructor(@Inject(BotHealthCheckService) private readonly healthCheckService: BotHealthCheckService) {}
  @Get(':botId/sample')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckBotHealthSamplesResp)
  getBotSample(
    @Param('botId') botId: string,
  ) {
    const samples = this.healthCheckService.getRecordStatics(botId)
    return Resp.ok(samples)
  }
}
