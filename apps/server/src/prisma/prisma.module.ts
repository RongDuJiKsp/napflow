import { Global, Logger, Module } from '@nestjs/common'
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
      const logger = new Logger(PrismaService.name)
      logger.log(`正在初始化数据库 ${configService.MYSQL_CONNECT_URL} ...`)
      // 初始化库表
      const conn = await mysql.createConnection({
        ...configService.sqlConnConfig,
        multipleStatements: true,
      })
      await conn.query(`CREATE DATABASE IF NOT EXISTS ${configService.envs.MYSQL_DATABASE}`)
      await conn.query(`USE ${configService.envs.MYSQL_DATABASE}`)
      const [result] = await conn.query<RowDataPacket[]>('SHOW TABLES')
      if (result.length === 0) {
        logger.log('数据库表不存在，开始初始化')
        const sql = await readFile(GEN_SQL_PATH, 'utf-8')
        await conn.query(sql)
      }
      else{
        logger.log('数据库表已存在，跳过初始化')
      }
      await conn.end()
      logger.log('数据库初始化完成')

      return new PrismaService(configService)
    },
    inject: [AppConfigService],
  }],
  exports: [PrismaService],
})
export class PrismaModule {}
