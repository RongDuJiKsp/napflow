import { PrismaService } from '@/src/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import type { WorkflowAppDataType }from '@shared/data-transfer/workflow/base'
@Injectable()
export class WorkflowService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
  ) {}

  async createWorkflowApp(appName: string, appDesc: string) {
    const app = await this.prismaService.workflowApp.create({
      data: { appName, appDescription: appDesc },
    })
    const extraData = await this.prismaService.workflowAppData.create({
      data: { ofAppId: app.appId },
    })
    return { ...app, extraData }
  }

  async getApp(appId: string) {
    return await this.prismaService.workflowApp.findFirst({
      where: { appId },
    })
  }

  async loadData(appId: string) {
    return await this.prismaService.workflowAppData.findFirst({ where: { ofAppId: appId } })
  }

  async syncData(appId: string, data: WorkflowAppDataType) {
    return await this.prismaService.workflowAppData.update({ where: { ofAppId: appId }, data })
  }
}
