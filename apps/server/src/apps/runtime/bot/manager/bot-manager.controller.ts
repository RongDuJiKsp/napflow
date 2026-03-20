import {
  Controller,
  Get,
  Inject,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common'
import { BotManagerService } from './bot-manager.service'
import { BotCoreRuntimeService } from '../core/bot-core-runtime.service'
import { AdapterTag } from '@shared/common/bot/core/adapter'
import { BotRunningState } from '@shared/common/bot/core/status'
import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import type { Account } from '@shared/common/account/base'
import { UserRole } from '@shared/common/account/core'
import { Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  type CreateBotReq,
  type UpdateBotReq,
  ZodCheckCreateBotReq,
  ZodCheckCreateBotResp,
  ZodCheckGetAllBotsResp,
  ZodCheckUpdateBotReq,
} from '@shared/data-transfer/bot/manager'
import { ZodBody } from '@/src/decorator/zod'

@Controller('bots')
export class BotManagerController {
  constructor(
    @Inject(BotManagerService)
    private readonly botManagerService: BotManagerService,
    @Inject(BotCoreRuntimeService)
    private readonly botCoreRuntimeService: BotCoreRuntimeService,
  ) {}

  @Get('list')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckGetAllBotsResp)
  async getAllBots(
    @Query('isRunning', new ParseBoolPipe({ optional: true }))
    isRunning?: boolean,
    @Query('adapterTag', new ParseEnumPipe(AdapterTag, { optional: true }))
    adapterTag?: AdapterTag,
  ) {
    const bots = (await this.botManagerService.allBotsStatus()).filter(
      (bot) => {
        if (isRunning !== undefined)
          return bot.state.runningState === BotRunningState.running
        if (adapterTag !== undefined) return bot.adapterTag === adapterTag
        return true
      },
    )
    return Resp.ok(bots)
  }

  @Post('create')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckCreateBotResp)
  async createBot(
    @ZodBody({ zod: ZodCheckCreateBotReq }) req: CreateBotReq,
    @JwtAccount() account: Account,
  ) {
    const botRec = await this.botManagerService.createBot(req, account)
    return Resp.ok({ botId: botRec.botId })
  }

  @Post(':botId/run')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async runBot(@Param('botId') botId: string) {
    await this.botCoreRuntimeService.runBot(botId)
    return Resp.ok()
  }

  @Post(':botId/stop')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async stopBot(@Param('botId') botId: string) {
    await this.botCoreRuntimeService.stopBot(botId)
    return Resp.ok()
  }

  @Post(':botId/kill')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async killBot(@Param('botId') botId: string) {
    await this.botCoreRuntimeService.killBot(botId)
    return Resp.ok()
  }

  @Post(':botId/reload')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async reloadBot(@Param('botId') botId: string) {
    await this.botCoreRuntimeService.reloadBot(botId)
    return Resp.ok()
  }

  @Post(':botId/update')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async updateBot(
    @Param('botId') botId: string,
    @ZodBody({ zod: ZodCheckUpdateBotReq }) req: UpdateBotReq,
  ) {
    await this.botManagerService.updateBot(botId, req)
    return Resp.ok()
  }
}
