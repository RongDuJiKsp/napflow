import { ZodBody } from '@/src/decorator/zod'
import { Controller, Inject, Post } from '@nestjs/common'
import { Code, Resp } from '@shared/data-transfer/_base'
import type { LoginReqType } from '@shared/data-transfer/account/account'
import type { LoginRespType } from '@shared/data-transfer/account/account'
import { LoginReq, LoginResp } from '@shared/data-transfer/account/account'
import { ZodSerializerDto } from 'nestjs-zod'
import { AccountService } from './account.service'
import { JwtService } from './jwt.service'

@Controller('account')
export class AccountController {
  constructor(@Inject(AccountService) private readonly accountService: AccountService,
    @Inject(JwtService) private readonly jwtService: JwtService) {}

  @Post('login')
  @ZodSerializerDto(LoginResp)
  async login(@ZodBody({ zod: LoginReq }) req: LoginReqType): Promise<LoginRespType> {
    const user = await this.accountService.getAccountWithVertify(req.email, req.password)
    if(!user)
      return Resp.error('用户不存在或密码错误', Code.NotFound)

    return Resp.ok({
      token: this.jwtService.account.jwtSign(user),
    })
  }
}
