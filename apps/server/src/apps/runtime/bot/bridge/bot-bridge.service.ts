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

  async getRecordOrThrow(botId: string) {
    const botRecord = await this.db.botRecord.findOne({ where: { recordId: botId } })
    if (!botRecord) throw new CommError('Bot记录不存在', Code.NotFound, 'warn')
    return botRecord
  }

  async bindBotToWorkflow(botId: string, appId: string, appVersion: string) {
    if(appVersion === 'draft') throw new CommError('不能绑定草稿版本', Code.BadRequest, 'warn')
    const botState = this.bot.botState(botId)
    if(BotRunningStateUtils.isRunning(botState.runningState))
      throw new CommError('Bot正在运行，只能在停止后绑定', Code.BadRequest, 'warn')
    const botRecord = await this.getRecordOrThrow(botId)
    if(!botRecord.commonAdapterConfig.bindingWorkflowApp)
      botRecord.commonAdapterConfig.bindingWorkflowApp = []
    botRecord.commonAdapterConfig.bindingWorkflowApp.push({ appId, version: appVersion })
    return await botRecord.save()
  }

  async bindingManyWorkflow(botId: string, bindings: { appId: string; version: string }[]) {
    if(bindings.some(({ version }) => version === 'draft'))
      throw new CommError('不能绑定草稿版本', Code.BadRequest, 'warn')
    const botRecord = await this.getRecordOrThrow(botId)
    if(!botRecord.commonAdapterConfig.bindingWorkflowApp)
      botRecord.commonAdapterConfig.bindingWorkflowApp = []
    botRecord.commonAdapterConfig.bindingWorkflowApp.push(...bindings)
    return await botRecord.save()
  }

  async getBotBindingWorkflow(botId: string) {
    const botRecord = await this.db.botRecord.findOne({ where: { recordId: botId } })
    if (!botRecord || !botRecord.commonAdapterConfig.bindingWorkflowApp) return null
    const bindings = botRecord.commonAdapterConfig.bindingWorkflowApp
    return await this.db.workflowAppData.find({
      where: bindings.map(({ appId, version }) => ({
        ofAppId: appId,
        version,
      })),
    })
  }
}
