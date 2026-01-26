import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import { BotCoreRuntimeService } from '../core/bot-core-runtime.service'
import { BotRunningStateUtils } from '@shared/common/bot/base'
import { CommError } from '@/src/apps/middleware/commerror.filter'
import { Code } from '@shared/data-transfer/_base'

@Injectable()
export class BotBridgeService {
  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
    @Inject(BotCoreRuntimeService) private readonly bot: BotCoreRuntimeService,
  ) {}

  async bindBotToWorkflow(botId: string, appId: string, appVersion: string) {
    const botState = this.bot.botState(botId)
    if(BotRunningStateUtils.isRunning(botState.runningState))
      throw new CommError('Bot正在运行，只能在停止后绑定', Code.BadRequest, 'warn')
    const botRecord = await this.db.botRecord.findOne({ where: { recordId: botId } })
    if (!botRecord) throw new CommError('Bot记录不存在', Code.NotFound, 'warn')
    botRecord.commonAdapterConfig.bindingWorkflowApp = { appId, version: appVersion }
    return await botRecord.save()
  }

  async getBotBindingWorkflow(botId: string) {
    const botRecord = await this.db.botRecord.findOne({ where: { recordId: botId } })
    if (!botRecord || !botRecord.commonAdapterConfig.bindingWorkflowApp) return null
    const { appId, version } = botRecord.commonAdapterConfig.bindingWorkflowApp
    return await this.db.workflowAppData.findOne({ where: { ofAppId: appId, version } })
  }
}
