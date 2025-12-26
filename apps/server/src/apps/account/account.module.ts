import { Global, Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { JwtService } from './jwt.service'
import { AccountInitService } from './account-init.service'

@Global()
@Module({
  controllers: [AccountController],
  providers: [AccountService, JwtService, AccountInitService],
  exports: [AccountService, JwtService, AccountInitService],
})
export class AccountModule {}
