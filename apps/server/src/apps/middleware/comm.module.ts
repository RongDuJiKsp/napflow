import type { DynamicModule } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { CommErrorExceptionFilter } from './commerror.filter'

@Module({

})
export class CommModule {
  static forRoot(): DynamicModule {
    return {
      module: CommModule,
      providers: [
        {
          provide: APP_FILTER,
          useClass: CommErrorExceptionFilter,
        },
      ],
      global: true,
    }
  }
}
