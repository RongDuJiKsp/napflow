import { Injectable } from '@nestjs/common'
import { PrismaClient } from './generated/client'
import type { ConfigService } from '@nestjs/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private configService: ConfigService) {
    const adapter = new PrismaMariaDb({}, { database: configService.get('MYSQL_DATABASE_URL') })
    super({ adapter })
  }
}
