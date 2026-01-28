import { AllowUserGroup } from '@/src/decorator/account'
import { Controller, Get, Inject, Param, Post } from '@nestjs/common'
import { UserRole } from '@shared/common/account/base'
import { ZodSerializerDto } from 'nestjs-zod'
import { type BotBridgeBindReq, ZodCheckBotBridgeBindReq, ZodCheckBotBridgeBindStatusResp } from '@shared/data-transfer/bot/bridge'
import { Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import { ZodBody } from '@/src/decorator/zod'
import { BotBridgeService } from './bot-bridge.service'

@Controller('bot-bridge')
export class BotBridgeController {
  constructor(
    @Inject(BotBridgeService)
    private readonly botBridgeService: BotBridgeService,
  ) {}

  @Post(':botId/bindmany')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async bind(
    @Param('botId') botId: string,
    @ZodBody({ zod: ZodCheckBotBridgeBindReq }) req: BotBridgeBindReq,
  ) {
    await this.botBridgeService.bindingManyWorkflow(botId, req.map(r => ({ appId: r.appId, version: r.appVersion })))
    return Resp.ok()
  }

  @Get(':botId/binding')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckBotBridgeBindStatusResp)
  async getBinding(@Param('botId') botId: string) {
    const binding = await this.botBridgeService.getBotBindingWorkflow(botId)
    return Resp.ok({
      target: binding,
    })
  }
}
