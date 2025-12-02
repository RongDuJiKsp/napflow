import { Global, Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { JwtService } from './jwt.service'

@Global()
@Module({
  controllers: [AccountController],
  providers: [AccountService, JwtService],
  exports: [AccountService, JwtService],
})
export class AccountModule {}
