import type { WorkflowAppDataEntity } from '@/src/apps/db/models/workflow.entity'
import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { CommError } from '@/src/apps/middleware/commerror.filter'
import { Inject, Injectable } from '@nestjs/common'
import { Code } from '@shared/data-transfer/_base'

// 这个不依赖bot的状态 直接从db读取 所以可以注入到Bot 尽量只依赖db
@Injectable()
export class BotBridgeForBotService {
  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
  ) {}

  async getRecordOrThrow(botId: string) {
    const botRecord = await this.db.botRecord.findOne({ where: { recordId: botId } })
    if (!botRecord) throw new CommError('Bot记录不存在', Code.NotFound, 'warn')
    return botRecord
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

  async getBindingConfig(botId: string, bindingId: string) {
    const botRecord = await this.db.botRecord.findOne({ where: { recordId: botId } })
    if(!botRecord)return null
    if(!botRecord.commonAdapterConfig.bindingWorkflowApp) return null
    const binding = botRecord.commonAdapterConfig.bindingWorkflowApp.find(({ bindingId: id }) => id === bindingId)
    if(!binding) return null
    return binding.bindingConfig
  }

  async getBindingsInfo(botId: string) {
    const botRecord = await this.db.botRecord.findOne({ where: { recordId: botId } })
    if(!botRecord)return null
    const bindingApp = await this.getBotBindingWorkflow(botId)
    if(!bindingApp) return null
    const getAppString = (app: Pick<WorkflowAppDataEntity, 'ofAppId' | 'version'>) => `[appId=${app.ofAppId},version=${app.version}]`
    const appMap = Object.fromEntries(bindingApp.map(app => [getAppString(app), app]))
    return botRecord.commonAdapterConfig.bindingWorkflowApp?.map(({ appId, version, bindingId }) => ({ appId, version, bindingId, appPublish: appMap[getAppString({ ofAppId: appId, version })] }))
  }
}
