import { PrismaService } from '@/src/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import type { WorkflowAppDataType } from '@shared/data-transfer/workflow/base'

const DRAFT_VERSION_KEY = 'draft'

@Injectable()
export class WorkflowDataService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
  ) {}

  async createDraft(appId: string) {
    // 创建data的publish
    await this.prismaService.workflowAppPublish.create({
      data: { ofAppId: appId, version: DRAFT_VERSION_KEY },
    })
    return await this.prismaService.workflowAppData.create({
      data: { ofAppId: appId, ofPublishVersion: DRAFT_VERSION_KEY },
    })
  }

  // 所有对data联表读写都在这
  async syncData(dataId: string, data: WorkflowAppDataType) {
    return await this.prismaService.workflowAppData.update({
      where: { dataId },
      data,
    })
  }

  async loadDraft(appId: string) {
    const draftData = await this.prismaService.workflowAppData.findFirst({
      where: { ofAppId: appId, ofPublishVersion: DRAFT_VERSION_KEY },
    })
    if (!draftData) return await this.createDraft(appId)

    return draftData
  }

  async syncDraft(appId: string, data: WorkflowAppDataType) {
    const appData = await this.prismaService.workflowAppData.findFirst({
      select: { dataId: true },
      where: { ofAppId: appId, ofPublishVersion: DRAFT_VERSION_KEY },
    })
    let dataId = appData?.dataId
    if (!dataId) {
      const newDraft = await this.createDraft(appId)
      dataId = newDraft.dataId
    }
    return await this.syncData(dataId, data)
  }
}
