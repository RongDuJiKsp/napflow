import { ZodBody } from '@/src/decorator/zod'
import { Controller, Post } from '@nestjs/common'
import type { LoginReqType } from '@shared/data-transfer/account/account'
import { LoginReq, LoginResp, type LoginRespType } from '@shared/data-transfer/account/account'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('account')
export class AccountController {
  @Post('login')
  @ZodSerializerDto(LoginResp)
  async login(@ZodBody({ zod: LoginReq }) req: LoginReqType): Promise<LoginRespType> {
    return {
      token: req.email + req.password,
    }
  }
}
