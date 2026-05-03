import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import { ZodBody } from '@/src/decorator/zod'
import type { Account } from '@shared/common/account/base'
import { UserRole } from '@shared/common/account/core'
import { Code, Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import type {
  AccountChangeNicknameReq,
  AccountChangePasswordReq,
  LoginReq,
} from '@shared/data-transfer/account/account'
import {
  ZodCheckAccountChangeNicknameReq,
  ZodCheckAccountChangePasswordReq,
  ZodCheckLoginReq,
  ZodCheckLoginResp,
} from '@shared/data-transfer/account/account'
import { Controller, Inject, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { AccountService } from './account.service'
import { JwtService } from './jwt.service'

/**
 * @route `/account`
 * @description 处理账号认证与当前用户资料修改
 */
@Controller('account')
export class AccountAuthController {
  constructor(
    @Inject(AccountService) private readonly accountService: AccountService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  /**
   * @route `/account/login`
   * @method POST
   * @description 登录并返回 JWT
   */
  @Post('login')
  @ZodSerializerDto(ZodCheckLoginResp)
  async login(@ZodBody({ zod: ZodCheckLoginReq }) req: LoginReq) {
    const user = await this.accountService.getAccountWithVertify(
      req.email,
      req.password,
    )
    if (!user) return Resp.error('用户不存在或密码错误', Code.NotFound)
    if (user.disabledAt) return Resp.error('用户已被禁用', Code.Forbidden)

    return Resp.ok({
      token: this.jwtService.account.jwtSign(user),
    })
  }

  /**
   * @route `/account/change/password`
   * @method POST
   * @description 修改当前登录用户的密码，需校验原密码
   */
  @Post('change/password')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async changePassword(
    @ZodBody({ zod: ZodCheckAccountChangePasswordReq })
    req: AccountChangePasswordReq,
    @JwtAccount() account: Account,
  ) {
    const userFull = await this.accountService.getAccountWithVertify(
      account.email,
      req.originPassword,
    )
    if (!userFull) return Resp.error('原密码错误', Code.Forbidden)

    await this.accountService.changePassword(account.email, req.password)
    return Resp.ok()
  }

  /**
   * @route `/account/change/nickname`
   * @method POST
   * @description 修改当前登录用户的昵称
   */
  @Post('change/nickname')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckNullResp)
  async changeNickname(
    @ZodBody({ zod: ZodCheckAccountChangeNicknameReq })
    req: AccountChangeNicknameReq,
    @JwtAccount() account: Account,
  ) {
    await this.accountService.changeNickname(account.email, req.nickname)
    return Resp.ok()
  }
}
