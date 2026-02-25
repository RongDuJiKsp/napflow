import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { Account } from '@shared/common/account/base'
@Injectable()
export class WorkflowService {
  constructor(@Inject(TypeOrmService) private readonly db: TypeOrmService) {}

  async createApp(appName: string, appDesc: string, createdBy: Account) {
    return await this.db.workflowApp.save({
      appName,
      appDescription: appDesc,
      createdBy: createdBy.email,
    })
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

  async updateApp(appId: string, appName: string, appDescription: string) {
    const app = await this.db.workflowApp.findOne({ where: { appId } })
    if (!app) return null
    app.appName = appName
    app.appDescription = appDescription
    return await this.db.workflowApp.save(app)
  }
}
