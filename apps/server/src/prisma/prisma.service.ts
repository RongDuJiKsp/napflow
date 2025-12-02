import { Inject, Injectable } from '@nestjs/common'
import { PrismaClient } from './generated/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { AppConfigService } from '../apps/app-config/app-config.service'
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(@Inject(AppConfigService) private readonly configService: AppConfigService) {
    const adapter = new PrismaMariaDb({}, { database: configService.MYSQL_DATABASE_URL })
    super({ adapter })
  }
}
