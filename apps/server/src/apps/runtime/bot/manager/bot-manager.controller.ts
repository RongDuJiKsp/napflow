import {
  Controller,
  Get,
  Inject,
  ParseBoolPipe,
  ParseEnumPipe,
  Query,
} from '@nestjs/common'
import { BotManagerService } from './bot-manager.service'
import {
  BotCoreRuntimeService,
  adapterClassMeta,
} from '../core/bot-core-runtime.service'
import { AdapterTag, BotRunningState } from '@shared/data-transfer/bot/_base'
import { AllowUserGroup } from '@/src/decorator/account'
import { UserRole } from '@shared/data-transfer/account/base'
import { Resp } from '@shared/data-transfer/_base'
import { ZodSerializerDto } from 'nestjs-zod'
import { ZodCheckGetAllBotsResp } from '@shared/data-transfer/bot/manager'

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
          adapterClassMeta[botRecord.adapterTag].adapterMeta.adapterDesc,
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
}
