import { AllowUserGroup } from '@/src/decorator/account'
import { Controller, Get, Inject, Param, Post } from '@nestjs/common'
import { UserRole } from '@shared/common/account/base'
import { ZodSerializerDto } from 'nestjs-zod'
import { type BotBridgeBindReq, type BotBridgeUnbindReq, type ConfigBotWorkflowAppBindingConfigReq, ZodCheckBotBindingConfigResp, ZodCheckBotBridgeBindReq, ZodCheckBotBridgeBindStatusResp, ZodCheckBotBridgeUnbindReq, ZodCheckConfigBotWorkflowAppBindingConfigReq } from '@shared/data-transfer/bot/bridge'
import { Code, Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import { ZodBody } from '@/src/decorator/zod'
import { BotBridgeService } from './bot-bridge.service'
import { BotBridgeForBotService } from './bot-bridge-for-bot'
import { TypeOrmService } from '@/src/apps/db/typeorm.service'

@Controller('bot-bridge')
export class BotBridgeController {
  constructor(
    @Inject(BotBridgeService)
    private readonly botBridgeService: BotBridgeService,
    @Inject(BotBridgeForBotService)
    private readonly botBridgeForBotService: BotBridgeForBotService,
    @Inject(TypeOrmService)
    private readonly db: TypeOrmService,
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
    const binding = await this.botBridgeForBotService.getBindingsInfo(botId)
    if(!binding) return Resp.ok([])
    const apps = await this.db.workflowApp.find({
      where: binding.map(({ appId }) => ({ appId })),
    })
    const appMap = Object.fromEntries(apps.map(app => [app.appId, app]))
    const bindingInfos = binding.map(item => ({
      ...item,
      app: appMap[item.appId],
    }))
    return Resp.ok(bindingInfos)
  }

  @Get(':botId/bindingconfig/:bindingId')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckBotBindingConfigResp)
  async getBindingConfig(
    @Param('botId') botId: string,
    @Param('bindingId') bindingId: string,
  ) {
    const config = await this.botBridgeForBotService.getBindingConfig(botId, bindingId)
    if(!config) return Resp.error('binding not found', Code.NotFound)
    return Resp.ok(config)
  }

  @Post(':botId/bindingconfig/:bindingId')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async configBinding(
    @Param('botId') botId: string,
    @Param('bindingId') bindingId: string,
    @ZodBody({ zod: ZodCheckConfigBotWorkflowAppBindingConfigReq }) req: ConfigBotWorkflowAppBindingConfigReq,
  ) {
    await this.botBridgeService.configBinding(botId, bindingId, req)
    return Resp.ok()
  }
}
