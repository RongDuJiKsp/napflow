import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import { ZodBody } from '@/src/decorator/zod'
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
import type { Account } from '@shared/common/account/base'
import { UserRole } from '@shared/common/account/core'
import { AdapterTag } from '@shared/common/bot/core/adapter'
import { BotRunningState } from '@shared/common/bot/core/status'
import { Code, Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import {
  type CreateBotReq,
  type UpdateBotReq,
  ZodCheckCreateBotReq,
  ZodCheckCreateBotResp,
  ZodCheckGetAllBotsResp,
  ZodCheckUpdateBotReq,
} from '@shared/data-transfer/bot/manager'
import { ZodSerializerDto } from 'nestjs-zod'
import { BotManagerService } from './bot-manager.service'

@Controller('bot/record')
export class BotManagerController {
  constructor(
    @Inject(BotManagerService)
    private readonly botManagerService: BotManagerService,
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

  @Post(':botId/delete')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async deleteBot(@Param('botId') botId: string) {
    const result = await this.botManagerService.deleteBot(botId)
    if (!result.affected) return Resp.error('Bot记录不存在', Code.NotFound)
    return Resp.ok()
  }
}
