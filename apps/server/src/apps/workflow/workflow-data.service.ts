import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { WorkflowAppData } from '@shared/common/workflow/base'

const DRAFT_VERSION_KEY = 'draft'

@Injectable()
export class WorkflowDataService {
  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
  ) {}

  async createDraft(appId: string) {
    // 判断draft是否已经创建了 创建了就返回null
    if(await this.db.workflowAppPublish.count({ where: { ofAppId: appId, version: DRAFT_VERSION_KEY } }))
      return null
    // 创建data的draft
    await this.db.workflowAppPublish.save({ ofAppId: appId, version: DRAFT_VERSION_KEY })
    return await this.db.workflowAppData.save({ ofAppId: appId, ofPublishVersion: DRAFT_VERSION_KEY })
  }

  async createPublish(appId: string, version: string, description: string, latestDraft: WorkflowAppData) {
    // 判断publish是否重复
    if(await this.db.workflowAppPublish.count({ where: { ofAppId: appId, version } }))
      return null

    // 创建data的publish
    const meta = await this.db.workflowAppPublish.save({ ofAppId: appId, version, description })
    await this.db.workflowAppData.save({ ...latestDraft, ofAppId: appId, ofPublishVersion: version, dataId: undefined })
    return meta
  }

  // 所有对data联表读写都在这
  async syncData(dataId: string, data: WorkflowAppData) {
    return await this.db.workflowAppData.update({ dataId }, { ...data, dataId: undefined })
  }

  async loadDraft(appId: string) {
    const draftData = await this.db.workflowAppData.findOne({
      where: { ofAppId: appId, ofPublishVersion: DRAFT_VERSION_KEY },
    })
    if (!draftData) return await this.createDraft(appId)

    return draftData
  }

  async syncDraft(appId: string, data: WorkflowAppData) {
    const appData = await this.db.workflowAppData.findOne({
      where: { ofAppId: appId, ofPublishVersion: DRAFT_VERSION_KEY },
    })
    let dataId = appData?.dataId
    if (!dataId) {
      const newDraft = (await this.createDraft(appId))!
      dataId = newDraft.dataId
    }
    return await this.syncData(dataId, data)
  }

  async publishDraft(appId: string, version: string, description: string) {
    // 首先复制一份draft
    const latestDraft = await this.loadDraft(appId)
    if (!latestDraft) return null
    // 创建publish
    return await this.createPublish(appId, version, description, latestDraft)
  }
}
