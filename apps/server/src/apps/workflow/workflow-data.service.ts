import type { WorkflowAppDataModel } from '@/src/prisma/generated/models'
import { PrismaService } from '@/src/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'

const DRAFT_VERSION_KEY = 'draft'

type WorkflowAppDataUpdate = Partial<WorkflowAppDataModel>

@Injectable()
export class WorkflowDataService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
  ) {}

  async createDraft(appId: string) {
    // 判断draft是否已经创建了 创建了就返回null
    if(await this.prismaService.workflowAppPublish.count({ where: { ofAppId: appId, version: DRAFT_VERSION_KEY } }))
      return null
    // 创建data的draft
    await this.prismaService.workflowAppPublish.create({
      data: { ofAppId: appId, version: DRAFT_VERSION_KEY },
    })
    return await this.prismaService.workflowAppData.create({
      data: { ofAppId: appId, ofPublishVersion: DRAFT_VERSION_KEY },
    })
  }

  async createPublish(appId: string, version: string, description: string, latestDraft: WorkflowAppDataUpdate) {
    // 判断publish是否重复
    if(await this.prismaService.workflowAppPublish.count({ where: { ofAppId: appId, version } }))
      return null

    // 创建data的publish
    const meta = await this.prismaService.workflowAppPublish.create({
      data: { ofAppId: appId, version, description },
    })
    await this.prismaService.workflowAppData.create({
      data: { ...latestDraft, ofAppId: appId, ofPublishVersion: version, dataId: undefined },
    })
    return meta
  }

  // 所有对data联表读写都在这
  async syncData(dataId: string, data: WorkflowAppDataUpdate) {
    return await this.prismaService.workflowAppData.update({
      where: { dataId },
      data: { ...data, dataId: undefined }, // dataId是主键，不能更新
    })
  }

  async loadDraft(appId: string) {
    const draftData = await this.prismaService.workflowAppData.findFirst({
      where: { ofAppId: appId, ofPublishVersion: DRAFT_VERSION_KEY },
    })
    if (!draftData) return await this.createDraft(appId)

    return draftData
  }

  async syncDraft(appId: string, data: WorkflowAppDataUpdate) {
    const appData = await this.prismaService.workflowAppData.findFirst({
      select: { dataId: true },
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
