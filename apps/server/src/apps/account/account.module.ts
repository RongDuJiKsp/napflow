import type { DynamicModule } from '@nestjs/common'
import { Global, Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { JwtService } from './jwt.service'
import { AccountInitService } from './account-init.service'
import { APP_FILTER, APP_GUARD } from '@nestjs/core/constants'
import { UserGroupGuard } from './middleware/account.guard'
import { AccountExceptionFilter } from './middleware/account.filter'
import { JsonWebTokenErrorFilter, VaildJwtErrorFilter } from './middleware/jwt.filter'

@Global()
@Module({
  controllers: [AccountController],
  providers: [AccountService, JwtService, AccountInitService],
  exports: [AccountService, JwtService, AccountInitService],
})
export class AccountModule {
  static forRoot(): DynamicModule {
    return {
      module: AccountModule,
      providers: [
        {
          provide: APP_GUARD,
          useClass: UserGroupGuard,
        },
        {
          provide: APP_FILTER,
          useClass: AccountExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: VaildJwtErrorFilter,
        },
        {
          provide: APP_FILTER,
          useClass: JsonWebTokenErrorFilter,
        },
      ],
      global: true,
    }
  }
}
