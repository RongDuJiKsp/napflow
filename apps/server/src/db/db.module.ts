import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppConfigService } from '../apps/app-config/app-config.service'

import { TypeOrmService } from './typeorm.service'
import { UserEntity, UserGroupEntity } from './models/account.entity'
import { WorkflowAppDataEntity, WorkflowAppEntity, WorkflowAppPublishEntity } from './models/workflow.entity'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory(configService: AppConfigService) {
        const { host, port, user, password } = configService.sqlConnConfig
        return {
          type: 'mysql',
          host,
          port,
          username: user,
          password,
          database: configService.envs.MYSQL_DATABASE,
          synchronize: true,
          entities: [
            UserEntity, UserGroupEntity,
            WorkflowAppEntity, WorkflowAppPublishEntity, WorkflowAppDataEntity,
          ],
        }
      },
      inject: [AppConfigService],
    }),
  ],
  providers: [TypeOrmService],
  exports: [TypeOrmModule, TypeOrmService],
})
export class DbModule {}
