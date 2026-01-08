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
import {
  BotCoreRuntimeService,
  adapterClassMeta,
} from '../core/bot-core-runtime.service'
import { AdapterTag, BotRunningState } from '@shared/common/bot/base'
import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import type { Account } from '@shared/common/account/base'
import { UserRole } from '@shared/common/account/base'
import { Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import { ZodSerializerDto } from 'nestjs-zod'
import { type CreateBotReq, ZodCheckCreateBotReq, ZodCheckCreateBotResp, ZodCheckGetAllBotsResp } from '@shared/data-transfer/bot/manager'
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
    const botRecords = await this.botManagerService.allBots()
    const bots = botRecords.map((botRecord) => {
      return {
        botId: botRecord.recordId,
        adapterTag: botRecord.adapterTag,
        adapterDesc:
          adapterClassMeta[botRecord.adapterTag].meta.desc,
        botDesc: botRecord.description,
        state: this.botCoreRuntimeService.botState(botRecord.recordId),
      }
    }).filter((bot) => {
      if (isRunning !== undefined)
        return bot.state.runningState === BotRunningState.running
      if (adapterTag !== undefined)
        return bot.adapterTag === adapterTag
      return true
    })
    return Resp.ok(bots)
  }

  @Post('create')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckCreateBotResp)
  async createBot(@ZodBody({ zod: ZodCheckCreateBotReq }) req: CreateBotReq, @JwtAccount() account: Account) {
    const botRec = await this.botManagerService.createBot(req, account)
    return Resp.ok({ botId: botRec.recordId })
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
}
