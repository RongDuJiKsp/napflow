import { ZodErrExceptionFilter } from '@/src/apps/zod/middleware/zod'
import { type DynamicModule, Global, Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'

@Global()
@Module({})
export class ZodModule {
  static forRoot(): DynamicModule {
    return {
      module: ZodModule,
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
          provide: APP_FILTER,
          useClass: ZodErrExceptionFilter,
        },
      ],
      global: true,
    }
  }
}
