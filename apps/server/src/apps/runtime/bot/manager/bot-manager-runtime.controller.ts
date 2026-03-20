import { AllowUserGroup } from '@/src/decorator/account'
import { Controller, Inject, Param, Post } from '@nestjs/common'
import { UserRole } from '@shared/common/account/core'
import { Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import { ZodSerializerDto } from 'nestjs-zod'
import { BotCoreRuntimeService } from '../core/bot-core-runtime.service'

@Controller('bot/runtime/:botId')
export class BotRuntimeController {
  constructor(
    @Inject(BotCoreRuntimeService)
    private readonly botCoreRuntimeService: BotCoreRuntimeService,
  ) {}

  @Post('run')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async runBot(@Param('botId') botId: string) {
    await this.botCoreRuntimeService.runBot(botId)
    return Resp.ok()
  }

  @Post('stop')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async stopBot(@Param('botId') botId: string) {
    await this.botCoreRuntimeService.stopBot(botId)
    return Resp.ok()
  }

  @Post('kill')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async killBot(@Param('botId') botId: string) {
    await this.botCoreRuntimeService.killBot(botId)
    return Resp.ok()
  }

  @Post('reload')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async reloadBot(@Param('botId') botId: string) {
    await this.botCoreRuntimeService.reloadBot(botId)
    return Resp.ok()
  }
}
