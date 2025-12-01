import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { NODE_ENV } from './config/common'
import { AccountController } from './apps/account/account.controller'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'
import { PrismaService } from './prisma/prisma-service'
import { UserGroupGuard } from './middleware/guard/account'

@Module({
  imports: [
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
  ],
  controllers: [AccountController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: UserGroupGuard,
    },
  ],
})
export class AppModule {}
