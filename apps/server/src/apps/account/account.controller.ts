import { ZodBody } from '@/src/decorator/zod'
import { Controller, Get, Inject, ParseArrayPipe, ParseBoolPipe, Post, Query } from '@nestjs/common'
import type { NullRespType } from '@shared/data-transfer/_base'
import { Code, NullResp, Resp } from '@shared/data-transfer/_base'
import type { AccountChangeNicknameReqType, AccountChangePasswordReqType, AccountCreateReqType, AccountDisableReqType, AccountInfoListRespType, AccountType, AccountUpDownGradeReqType, AccountUpDownGradeRespType, CurAccountInfoRespType, LoginReqType } from '@shared/data-transfer/account/account'
import type { LoginRespType } from '@shared/data-transfer/account/account'
import { Account, AccountChangeNicknameReq, AccountChangePasswordReq, AccountCreateReq, AccountDisableReq, AccountInfoListQuery, AccountInfoListResp, AccountUpDownGradeReq, AccountUpDownGradeResp, CurAccountInfoResp, LoginReq, LoginResp } from '@shared/data-transfer/account/account'
import { ZodSerializerDto } from 'nestjs-zod'
import { AccountService } from './account.service'
import { JwtService } from './jwt.service'
import { AllowUserGroup } from '@/src/decorator/account'
import { UserGroupTypes } from '@/src/prisma/generated/enums'
import { JwtBody } from '@/src/decorator/jwt'

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
    if(user.disabledAt)
      return Resp.error('用户已被禁用', Code.NotFound)

    return Resp.ok({
      token: this.jwtService.account.jwtSign(user),
    })
  }

  @Get('account')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(AccountInfoListResp)
  async getAccount(@Query('isDisabled', ParseBoolPipe) isDisabled?: boolean, @Query('roles', ParseArrayPipe) roles?: string[]): Promise<AccountInfoListRespType> {
    const accounts = await this.accountService.queryAccounts(AccountInfoListQuery.parse({
      isDisabled,
      roles,
    }))
    return Resp.ok(accounts)
  }

  @Get('cur-account')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(CurAccountInfoResp)
  async getCurAccount(@JwtBody({ zod: Account }) account: AccountType): Promise<CurAccountInfoRespType> {
    const curAccount = await this.accountService.getAccount(account.email)
    if(!curAccount)
      throw new Error('签发了token的用户不存在')
    return Resp.ok(curAccount)
  }

  @Post('upgrade')
  @AllowUserGroup(UserGroupTypes.Admin)
  @ZodSerializerDto(AccountUpDownGradeResp)
  async upgradeAccount(@ZodBody({ zod: AccountUpDownGradeReq }) req: AccountUpDownGradeReqType): Promise<AccountUpDownGradeRespType> {
    if(req.groupType.includes(UserGroupTypes.User))
      return Resp.error('不能对User组进行升降级', Code.BadRequest)
    const res = await this.accountService.upgradeAccount(req.email, req.groupType)
    return Resp.ok({ effectLines: res.count })
  }

  @Post('downgrade')
  @AllowUserGroup(UserGroupTypes.Admin)
  @ZodSerializerDto(AccountUpDownGradeResp)
  async downgradeAccount(@ZodBody({ zod: AccountUpDownGradeReq }) req: AccountUpDownGradeReqType): Promise<AccountUpDownGradeRespType> {
    if(req.groupType.includes(UserGroupTypes.User))
      return Resp.error('不能对User组进行升降级', Code.BadRequest)
    const res = await this.accountService.downgradeAccount(req.email, req.groupType)
    return Resp.ok({ effectLines: res.count })
  }

  @Post('disable')
  @AllowUserGroup(UserGroupTypes.Admin)
  @ZodSerializerDto(NullResp)
  async disableAccount(@ZodBody({ zod: AccountDisableReq }) req: AccountDisableReqType): Promise<NullRespType> {
    await this.accountService.disableAccount(req.email)
    return Resp.ok(undefined)
  }

  @Post('create')
  @AllowUserGroup(UserGroupTypes.Admin)
  @ZodSerializerDto(NullResp)
  async createAccount(@ZodBody({ zod: AccountCreateReq }) req: AccountCreateReqType): Promise<NullRespType> {
    await this.accountService.createCustomAccount(req.email, req.nickname, req.password)
    return Resp.ok(undefined)
  }

  @Post('change-password')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(NullResp)
  async changePassword(@ZodBody({ zod: AccountChangePasswordReq }) req: AccountChangePasswordReqType, @JwtBody({ zod: Account }) account: AccountType): Promise<NullRespType> {
    const userFull = await this.accountService.getAccountWithVertify(account.email, req.originPassword)
    if(!userFull)
      return Resp.error('原密码错误', Code.BadRequest)

    await this.accountService.changePassword(account.email, req.password)
    return Resp.ok(undefined)
  }

  @Post('change-nickname')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(NullResp)
  async changeNickname(@ZodBody({ zod: AccountChangeNicknameReq }) req: AccountChangeNicknameReqType, @JwtBody({ zod: Account }) account: AccountType): Promise<NullRespType> {
    await this.accountService.changeNickname(account.email, req.nickname)
    return Resp.ok(undefined)
  }
}
