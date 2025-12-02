import { ZodBody } from '@/src/decorator/zod'
import type { PrismaService } from '@/src/prisma/prisma-service'
import { jwtSignAccount } from '@/src/utils/account'
import { Controller, Post } from '@nestjs/common'
import { Code, Resp } from '@shared/data-transfer/_base'
import type { LoginReqType } from '@shared/data-transfer/account/account'
import { LoginReq, LoginResp, type LoginRespType } from '@shared/data-transfer/account/account'
import { ZodSerializerDto } from 'nestjs-zod'
import bcryptjs from 'bcryptjs'
@Controller('account')
export class AccountController {
  constructor(private prismaService: PrismaService) {}
  @Post('login')
  @ZodSerializerDto(LoginResp)
  async login(@ZodBody({ zod: LoginReq }) req: LoginReqType): Promise<LoginRespType> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: req.email,
      },
      include: {
        userGroup: { select: { groupType: true, createdAt: true } },
      },
    })
    if(!user)
      return Resp.error('user not found', Code.NotFound)
    if(!await bcryptjs.compare(req.password, user.password))
      return Resp.error('password error', Code.NotFound)

    return Resp.ok({
      token: jwtSignAccount(user),
    })
  }
}
