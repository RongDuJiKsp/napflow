import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { NODE_ENV } from './config/env'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'
import { UserGroupGuard } from './middleware/guard/account'
import { AccountModule } from './apps/account/account.module'
import { AppConfigModule } from './apps/app-config/app-config.module'
import { PrismaModule } from './prisma/prisma.module'

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
    PrismaModule,
    // ---------------------- 应用模块 ----------------------
    AccountModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: UserGroupGuard,
    },
  ],
})
export class AppModule {}
