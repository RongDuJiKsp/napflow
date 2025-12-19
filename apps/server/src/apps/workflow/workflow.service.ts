import { TypeOrmService } from '@/src/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { AccountType } from '@shared/data-transfer/account/base'
@Injectable()
export class WorkflowService {
  constructor(
    @Inject(TypeOrmService) private readonly db: TypeOrmService,
  ) {}

  async createApp(appName: string, appDesc: string, createdBy: AccountType) {
    return await this.db.workflowApp.save({ appName, appDescription: appDesc, createdBy: createdBy.email })
  }

  async deleteApp(appId: string) {
    return await this.db.workflowApp.delete({ appId })
  }

  async getApp(appId: string) {
    return await this.db.workflowApp.findOne({
      where: { appId },
    })
  }

  async getApps(creator?: string) {
    return await this.db.workflowApp.find({ where: { createdBy: creator } })
  }
}
