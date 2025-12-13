import { PrismaService } from '@/src/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import type { WorkflowAppDataType }from '@shared/data-transfer/workflow/base'
@Injectable()
export class WorkflowService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
  ) {}

  async createApp(appName: string, appDesc: string) {
    return await this.prismaService.workflowApp.create({
      data: { appName, appDescription: appDesc },
    })
  }

  async deleteApp(appId: string) {
    return await this.prismaService.workflowApp.delete({ where: { appId } })
  }

  async getApp(appId: string) {
    return await this.prismaService.workflowApp.findFirst({
      where: { appId },
    })
  }

  async loadDraft(appId: string) {
    return await this.prismaService.workflowAppData.findFirst({ where: { ofAppId: appId, ofPublishVersion: 'draft' } })
  }

  async syncData(dataId: string, data: WorkflowAppDataType) {
    return await this.prismaService.workflowAppData.update({ where: { dataId }, data })
  }
}
