import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { NODE_ENV } from './config/env'
import { AccountModule } from './apps/account/account.module'
import { AppConfigModule } from './apps/app-config/app-config.module'
import { WorkflowModule } from './apps/workflow/workflow.module'
import { DbModule } from './apps/db/db.module'
import { ZodModule } from './apps/zod/zod.module'
import { RuntimeModule } from './apps/runtime/runtime.module'
import { HealthCheckModule } from './apps/health/health-check.module'
import { CommModule } from './apps/middleware/comm.module'
import { AgentModule } from './apps/agent/agent.module'

@Module({
  imports: [
    // 首先加载环境变量配置模块
    ConfigModule.forRoot({
      // common as nextjs
      // 如果一个变量存在于多个文件中，则以第一个文件中的变量为准。
      envFilePath: [
        `.env.${NODE_ENV}.local`,
        `.env.${NODE_ENV}`,
        '.env.local',
        '.env',
      ],
      isGlobal: true,
      // 变量展开
      expandVariables: true,
    }),
    // 随后加载应用配置模块
    AppConfigModule,
    DbModule,
    // ---------------------- 库Wrapper模块 ----------------------
    ZodModule.forRoot(),
    // ---------------------- 应用模块 ----------------------
    CommModule.forRoot(),
    AccountModule.forRoot(),
    WorkflowModule,
    AgentModule,
    RuntimeModule,
    HealthCheckModule,
  ],
})
export class AppModule {}
