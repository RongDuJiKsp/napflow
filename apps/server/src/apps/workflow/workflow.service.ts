import { PrismaService } from '@/src/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import type { WorkflowAppDataType }from '@shared/data-transfer/workflow/base'
@Injectable()
export class WorkflowService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
  ) {}

  async createWorkflowApp(appName: string, appDesc: string) {
    return await this.prismaService.workflowApp.create({
      data: { appName, appDescription: appDesc },
    })
  }

  async getApp(appId: string) {
    return await this.prismaService.workflowApp.findFirst({
      where: { appId },
    })
  }

  async loadDraft(appId: string) {
    return await this.prismaService.workflowAppData.findFirst({ where: { ofAppId: appId } })
  }

  async syncData(appId: string, data: WorkflowAppDataType) {
    return await this.prismaService.workflowAppData.update({ where: { ofAppId: appId }, data })
  }
}
