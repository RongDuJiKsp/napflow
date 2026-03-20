import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import { BotCoreRuntimeService } from '../core/bot-core-runtime.service'
import { BotRunningStateUtils } from '@shared/common/bot/core/status'
import { CommError } from '@/src/apps/middleware/commerror.filter'
import { Code } from '@shared/data-transfer/_base'
import { randomUUID } from 'node:crypto'
import { BotBridgeForBotService } from './bot-bridge-for-bot'
import type { BotWorkflowAppBindingConfig } from '@shared/common/bot/core/config'
import type { PartialDeep } from 'type-fest'
import { merge } from 'lodash-es'

@Injectable()
export class BotBridgeService {
  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
    @Inject(BotCoreRuntimeService) private readonly bot: BotCoreRuntimeService,
    @Inject(BotBridgeForBotService)
    private readonly bridge: BotBridgeForBotService,
  ) {}

  async bindBotToWorkflow(botId: string, appId: string, appVersion: string) {
    if (appVersion === 'draft')
      throw new CommError('不能绑定草稿版本', Code.BadRequest, 'warn')
    const botState = this.bot.botState(botId)
    if (BotRunningStateUtils.isRunning(botState.runningState)) {
      throw new CommError(
        'Bot正在运行，只能在停止后绑定',
        Code.BadRequest,
        'warn',
      )
    }
    const botRecord = await this.bridge.getRecordOrThrow(botId)
    if (!botRecord.commonAdapterConfig.bindingWorkflowApp)
      botRecord.commonAdapterConfig.bindingWorkflowApp = []
    // 可以将相同appId的相同版本绑定到同一个bot 这是因为相同的插件配合不同的env可以实现不同的效果
    botRecord.commonAdapterConfig.bindingWorkflowApp.push({
      appId,
      version: appVersion,
      bindingId: randomUUID(),
    })
    return await botRecord.save()
  }

  async bindingManyWorkflow(
    botId: string,
    bindings: { appId: string; version: string }[],
  ) {
    if (bindings.some(({ version }) => version === 'draft'))
      throw new CommError('不能绑定草稿版本', Code.BadRequest, 'warn')
    const botState = this.bot.botState(botId)
    if (BotRunningStateUtils.isRunning(botState.runningState)) {
      throw new CommError(
        'Bot正在运行，只能在停止后绑定',
        Code.BadRequest,
        'warn',
      )
    }
    const botRecord = await this.bridge.getRecordOrThrow(botId)
    if (!botRecord.commonAdapterConfig.bindingWorkflowApp)
      botRecord.commonAdapterConfig.bindingWorkflowApp = []
    botRecord.commonAdapterConfig.bindingWorkflowApp.push(
      ...bindings.map(({ appId, version }) => ({
        appId,
        version,
        bindingId: randomUUID(),
      })),
    )
    return await botRecord.save()
  }

  async delBindings(botId: string, bindingIds: string[]) {
    const botState = this.bot.botState(botId)
    if (BotRunningStateUtils.isRunning(botState.runningState)) {
      throw new CommError(
        'Bot正在运行，只能在停止后删除绑定',
        Code.BadRequest,
        'warn',
      )
    }
    const botRecord = await this.bridge.getRecordOrThrow(botId)
    if (!botRecord.commonAdapterConfig.bindingWorkflowApp)
      botRecord.commonAdapterConfig.bindingWorkflowApp = []
    botRecord.commonAdapterConfig.bindingWorkflowApp
      = botRecord.commonAdapterConfig.bindingWorkflowApp.filter(
        ({ bindingId }) => !bindingIds.includes(bindingId),
      )
    return await botRecord.save()
  }

  async configBinding(
    botId: string,
    bindingId: string,
    config: PartialDeep<BotWorkflowAppBindingConfig>,
  ) {
    const botState = this.bot.botState(botId)
    if (BotRunningStateUtils.isRunning(botState.runningState)) {
      throw new CommError(
        'Bot正在运行，只能在停止后配置绑定',
        Code.BadRequest,
        'warn',
      )
    }
    const botRecord = await this.bridge.getRecordOrThrow(botId)
    if (!botRecord.commonAdapterConfig.bindingWorkflowApp)
      botRecord.commonAdapterConfig.bindingWorkflowApp = []
    const binding = botRecord.commonAdapterConfig.bindingWorkflowApp.find(
      ({ bindingId: id }) => id === bindingId,
    )
    if (!binding) throw new CommError('绑定不存在', Code.BadRequest, 'warn')
    binding.bindingConfig = merge(binding.bindingConfig, config)
    return await botRecord.save()
  }
}
