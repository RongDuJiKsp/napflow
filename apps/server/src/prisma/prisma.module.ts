import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { AppConfigService } from '../apps/app-config/app-config.service'
import type { RowDataPacket } from 'mysql2/promise'
import mysql from 'mysql2/promise'
import { readFile } from 'node:fs/promises'
import { GEN_SQL_PATH } from '../config/path'
@Global()
@Module({
  providers: [{
    provide: PrismaService,
    useFactory: async (configService: AppConfigService) => {
      // 初始化库表
      const conn = await mysql.createConnection({
        ...configService.sqlConnConfig,
        multipleStatements: true,
      })
      await conn.query(`CREATE DATABASE IF NOT EXISTS ${configService.envs.MYSQL_DATABASE}`)
      await conn.query(`USE ${configService.envs.MYSQL_DATABASE}`)
      const [result] = await conn.query<RowDataPacket[]>('SHOW TABLES')
      if (result.length === 0) {
        const sql = await readFile(GEN_SQL_PATH, 'utf-8')
        await conn.query(sql)
      }
      await conn.end()

      return new PrismaService(configService)
    },
    inject: [AppConfigService],
  }],
  exports: [PrismaService],
})
export class PrismaModule {}
