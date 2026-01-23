import { Global, Logger, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppConfigService } from '../app-config/app-config.service'
import mysql from 'mysql2/promise'
import { TypeOrmService } from './typeorm.service'
import { UserEntity, UserGroupEntity } from './models/account.entity'
import { WorkflowAppDataEntity, WorkflowAppEntity } from './models/workflow.entity'
import { BotRecordEntity } from './models/bot.entity'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: AppConfigService) => {
        const logger = new Logger(TypeOrmService.name)
        logger.log(`正在初始化数据库 ${configService.MYSQL_CONNECT_URL} ...`)
        // 自动建库
        const conn = await mysql.createConnection({
          ...configService.sqlConnConfig,
          multipleStatements: true,
        })
        await conn.query(`CREATE DATABASE IF NOT EXISTS ${configService.envs.MYSQL_DATABASE}`)
        await conn.end()

        const { host, port, user, password } = configService.sqlConnConfig
        return {
          type: 'mysql',
          host,
          port,
          username: user,
          password,
          database: configService.envs.MYSQL_DATABASE,
          synchronize: true,
          autoLoadEntities: true,
        }
      },
      inject: [AppConfigService],
    }),
    TypeOrmModule.forFeature([
      UserEntity, UserGroupEntity,
      WorkflowAppEntity, WorkflowAppDataEntity,
      BotRecordEntity,
    ]),
  ],
  providers: [TypeOrmService],
  exports: [TypeOrmModule, TypeOrmService],
})
export class DbModule {}
