import { AllowUserGroup } from '@/src/decorator/account'
import { Controller, Get, Inject, Param, Post } from '@nestjs/common'
import { UserRole } from '@shared/common/account/base'
import { ZodSerializerDto } from 'nestjs-zod'
import { type BotBridgeBindReq, type BotBridgeUnbindReq, ZodCheckBotBridgeBindReq, ZodCheckBotBridgeBindStatusResp, ZodCheckBotBridgeUnbindReq } from '@shared/data-transfer/bot/bridge'
import { Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import { ZodBody } from '@/src/decorator/zod'
import { BotBridgeService } from './bot-bridge.service'
import { BotBridgeForBotService } from './bot-bridge-for-bot'

@Controller('bot-bridge')
export class BotBridgeController {
  constructor(
    @Inject(BotBridgeService)
    private readonly botBridgeService: BotBridgeService,
    @Inject(BotBridgeForBotService)
    private readonly botBridgeForBotService: BotBridgeForBotService,
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

  @Post(':botId/unbindmany')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async unbind(
    @Param('botId') botId: string,
    @ZodBody({ zod: ZodCheckBotBridgeUnbindReq }) req: BotBridgeUnbindReq,
  ) {
    await this.botBridgeService.delBindings(botId, req.bindingIds)
    return Resp.ok()
  }

  @Get(':botId/binding')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckBotBridgeBindStatusResp)
  async getBinding(@Param('botId') botId: string) {
    const binding = await this.botBridgeService.getBindingsInfo(botId)
    return Resp.ok(binding)
  }
}
