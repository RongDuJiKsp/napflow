import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import { BotCoreRuntimeService } from '../core/bot-core-runtime.service'
import { BotRunningStateUtils } from '@shared/common/bot/base'
import { CommError } from '@/src/apps/middleware/commerror.filter'
import { Code } from '@shared/data-transfer/_base'
import { randomUUID } from 'node:crypto'
import { BotBridgeForBotService } from './bot-bridge-for-bot'
import type { WorkflowAppDataEntity } from '@/src/apps/db/models/workflow.entity'

@Injectable()
export class BotBridgeService {
  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
    @Inject(BotCoreRuntimeService) private readonly bot: BotCoreRuntimeService,
    @Inject(BotBridgeForBotService) private readonly bridge: BotBridgeForBotService,
  ) {}

  async bindBotToWorkflow(botId: string, appId: string, appVersion: string) {
    if(appVersion === 'draft') throw new CommError('不能绑定草稿版本', Code.BadRequest, 'warn')
    const botState = this.bot.botState(botId)
    if(BotRunningStateUtils.isRunning(botState.runningState))
      throw new CommError('Bot正在运行，只能在停止后绑定', Code.BadRequest, 'warn')
    const botRecord = await this.bridge.getRecordOrThrow(botId)
    if(!botRecord.commonAdapterConfig.bindingWorkflowApp)
      botRecord.commonAdapterConfig.bindingWorkflowApp = []
    // 可以将相同appId的相同版本绑定到同一个bot 这是因为相同的插件配合不同的env可以实现不同的效果
    botRecord.commonAdapterConfig.bindingWorkflowApp.push({ appId, version: appVersion, bindingId: randomUUID() })
    return await botRecord.save()
  }

  async bindingManyWorkflow(botId: string, bindings: { appId: string; version: string }[]) {
    if(bindings.some(({ version }) => version === 'draft'))
      throw new CommError('不能绑定草稿版本', Code.BadRequest, 'warn')
    const botState = this.bot.botState(botId)
    if(BotRunningStateUtils.isRunning(botState.runningState))
      throw new CommError('Bot正在运行，只能在停止后绑定', Code.BadRequest, 'warn')
    const botRecord = await this.bridge.getRecordOrThrow(botId)
    if(!botRecord.commonAdapterConfig.bindingWorkflowApp)
      botRecord.commonAdapterConfig.bindingWorkflowApp = []
    botRecord.commonAdapterConfig.bindingWorkflowApp.push(...bindings.map(({ appId, version }) => ({ appId, version, bindingId: randomUUID() })))
    return await botRecord.save()
  }

  async delBindings(botId: string, bindingIds: string[]) {
    const botRecord = await this.bridge.getRecordOrThrow(botId)
    if(!botRecord.commonAdapterConfig.bindingWorkflowApp)
      botRecord.commonAdapterConfig.bindingWorkflowApp = []
    botRecord.commonAdapterConfig.bindingWorkflowApp = botRecord.commonAdapterConfig.bindingWorkflowApp.filter(({ bindingId }) => !bindingIds.includes(bindingId))
    return await botRecord.save()
  }

  async getBindingsInfo(botId: string) {
    const botRecord = await this.db.botRecord.findOne({ where: { recordId: botId } })
    if(!botRecord)return null
    const bindingApp = await this.bridge.getBotBindingWorkflow(botId)
    if(!bindingApp) return null
    const getAppString = (app: Pick<WorkflowAppDataEntity, 'ofAppId' | 'version'>) => `[appId=${app.ofAppId},version=${app.version}]`
    const appMap = Object.fromEntries(bindingApp.map(app => [getAppString(app), app]))
    return botRecord.commonAdapterConfig.bindingWorkflowApp?.map(({ appId, version, bindingId }) => ({ appId, version, bindingId, app: appMap[getAppString({ ofAppId: appId, version })] }))
  }
}
