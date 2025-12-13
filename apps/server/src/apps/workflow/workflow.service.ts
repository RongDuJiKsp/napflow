import { PrismaService } from '@/src/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import type { AccountType } from '@shared/data-transfer/account/base'
@Injectable()
export class WorkflowService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
  ) {}

  async createApp(appName: string, appDesc: string, createdBy: AccountType) {
    return await this.prismaService.workflowApp.create({
      data: { appName, appDescription: appDesc, createdBy: createdBy.email },
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

  async getApps(creator?: string) {
    return await this.prismaService.workflowApp.findMany({ where: { createdBy: creator } })
  }
}
