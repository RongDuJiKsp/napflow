import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { WorkflowAppData } from '@shared/common/workflow/entity'
import type { WorkflowAppDraft } from '@shared/common/workflow/base'
import { CommError } from '../middleware/commerror.filter'
import { Code } from '@shared/data-transfer/_base'
import type { Account } from '@shared/common/account/base'
import { Not } from 'typeorm'

const DRAFT_VERSION_KEY = 'draft'

@Injectable()
export class WorkflowDataService {
  constructor(@Inject(TypeOrmService) private readonly db: TypeOrmService) {}

  // 查

  async findData(appId: string, version: string) {
    return await this.db.workflowAppData.findOne({
      where: { ofAppId: appId, version },
    })
  }

  async getDatas(appId: string) {
    return await this.db.workflowAppData.find({
      where: { ofAppId: appId },
      order: {
        publishAt: 'DESC',
      },
    })
  }

  async getLastestPublish(appId: string) {
    return await this.db.workflowAppData.findOne({
      where: { ofAppId: appId, version: Not(DRAFT_VERSION_KEY) },
      order: {
        publishAt: 'DESC',
      },
    })
  }

  // 增删改

  async createDraft(appId: string) {
    // 判断draft是否已经创建了 创建了就返回null
    if (
      await this.db.workflowAppData.count({
        where: { ofAppId: appId, version: DRAFT_VERSION_KEY },
      })
    )
      return null
    // 创建data的draft
    return await this.db.workflowAppData.save({
      ofAppId: appId,
      version: DRAFT_VERSION_KEY,
    })
  }

  async createPublish(
    appId: string,
    version: string,
    description: string,
    latestDraft: WorkflowAppData,
    extra: Partial<WorkflowAppData>,
  ) {
    if (version === DRAFT_VERSION_KEY)
      throw new CommError('不能发布draft', Code.BadRequest, 'warn')

    // 判断publish是否重复
    if (
      await this.db.workflowAppData.count({
        where: { ofAppId: appId, version },
      })
    )
      return null

    // 创建data的publish
    return await this.db.workflowAppData.save({
      ...latestDraft,
      ofAppId: appId,
      version,
      publishDescription: description,
      ...extra,
    })
  }

  async loadDraft(appId: string) {
    const draftData = await this.findData(appId, DRAFT_VERSION_KEY)
    if (!draftData) return await this.createDraft(appId)

    return draftData
  }

  async syncDraft(appId: string, data: WorkflowAppDraft) {
    return await this.db.workflowAppData.save({
      ...data,
      ofAppId: appId,
      version: DRAFT_VERSION_KEY,
    })
  }

  async publishDraft(
    appId: string,
    version: string,
    description: string,
    publisher: Account,
  ) {
    // 首先复制一份draft
    const latestDraft = await this.loadDraft(appId)
    if (!latestDraft) return null
    // 创建publish
    return await this.createPublish(appId, version, description, latestDraft, {
      publishAt: new Date(),
      publishBy: publisher.email,
    })
  }
}
