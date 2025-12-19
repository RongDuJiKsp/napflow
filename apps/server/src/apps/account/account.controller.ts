import { ZodBody } from '@/src/decorator/zod'
import {
  Controller,
  Get,
  Inject,
  ParseArrayPipe,
  ParseBoolPipe,
  Post,
  Query,
} from '@nestjs/common'
import type { NullRespType } from '@shared/data-transfer/_base'
import { Code, NullResp, Resp } from '@shared/data-transfer/_base'
import type {
  AccountChangeNicknameReqType,
  AccountChangePasswordReqType,
  AccountCreateReqType,
  AccountDisableReqType,
  AccountUpDownGradeReqType,
  LoginReqType,
} from '@shared/data-transfer/account/account'
import {
  AccountChangeNicknameReq,
  AccountChangePasswordReq,
  AccountCreateReq,
  AccountDisableReq,
  AccountInfoListQuery,
  AccountInfoListResp,
  AccountInfoResp,
  AccountUpDownGradeReq,
  AccountUpDownGradeResp,
  LoginReq,
  LoginResp,
} from '@shared/data-transfer/account/account'
import { ZodSerializerDto } from 'nestjs-zod'
import { AccountService } from './account.service'
import { JwtService } from './jwt.service'
import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import type { AccountType } from '@shared/data-transfer/account/base'
import { UserGroupTypes } from '@/src/db/models/account.entity'

/**
 * @route `/account`
 * @description 处理账号相关操作（登录、查询、创建、禁用、升降级、修改昵称/密码）。
 */
@Controller('account')
export class AccountController {
  constructor(
    @Inject(AccountService) private readonly accountService: AccountService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  /**
   * @route `/account/login`
   * @method POST
   * @role Public（无需登录）
   * @reqbody 使用 Zod 验证的 `LoginReq`（包含 `email` 和 `password`）
   * @resp `LoginResp`（包含 `token`）
   * @description 登录并返回 JWT
   */
  @Post('login')
  @ZodSerializerDto(LoginResp)
  async login(
    @ZodBody({ zod: LoginReq }) req: LoginReqType,
  ) {
    const user = await this.accountService.getAccountWithVertify(
      req.email,
      req.password,
    )
    if (!user) return Resp.error('用户不存在或密码错误', Code.NotFound)
    if (user.disabledAt) return Resp.error('用户已被禁用', Code.NotFound)

    return Resp.ok({
      token: this.jwtService.account.jwtSign(user),
    })
  }

  /**
   * @route `/account/account`
   * @method GET
   * @role User
   * @query `isDisabled` (boolean, optional), `roles` (string[], optional)
   * @reqbody 无
   * @resp `AccountInfoListResp`（账号列表）
   * @description 返回账号列表，支持按是否禁用和角色筛选
   */
  @Get('account')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(AccountInfoListResp)
  async getAccount(
    @Query('isDisabled', new ParseBoolPipe({ optional: true }))
    isDisabled?: boolean,
    @Query('roles', new ParseArrayPipe({ optional: true })) roles?: string[],
  ) {
    const accounts = await this.accountService.queryAccounts(
      AccountInfoListQuery.parse({
        isDisabled,
        roles,
      }),
    )
    return Resp.ok(accounts)
  }

  /**
   * @route `/account/cur-account`
   * @method GET
   * @role User
   * @reqbody 无
   * @resp `AccountInfoResp`（当前用户详情）
   * @description 返回当前登录用户的详情
   */
  @Get('cur-account')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(AccountInfoResp)
  async getCurAccount(
    @JwtAccount() account: AccountType,
  ) {
    const curAccount = await this.accountService.getAccount(account.email)
    if (!curAccount) throw new Error('签发了token的用户不存在')
    return Resp.ok(curAccount)
  }

  /**
   * @route `/account/account-info`
   * @method GET
   * @role User
   * @query `email` (string)
   * @reqbody 无
   * @resp `AccountInfoResp`（指定用户详情）
   * @description 根据 email 返回指定用户信息
   */
  @Get('account-info')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(AccountInfoResp)
  async getAccountInfo(
    @Query('email') email: string,
  ) {
    const curAccount = await this.accountService.getAccount(email)
    return Resp.ok(curAccount)
  }

  /**
   * @route `/account/upgrade`
   * @method POST
   * @role Admin
   * @reqbody `AccountUpDownGradeReq`（包含 `email` 与 `groupType`，且不可包含 `User` 组）
   * @resp `AccountUpDownGradeResp`（包含影响行数）
   * @description 提升目标账号的用户组
   */
  @Post('upgrade')
  @AllowUserGroup(UserGroupTypes.Admin)
  @ZodSerializerDto(AccountUpDownGradeResp)
  async upgradeAccount(
    @ZodBody({ zod: AccountUpDownGradeReq }) req: AccountUpDownGradeReqType,
  ) {
    if (req.groupType.includes(UserGroupTypes.User))
      return Resp.error('不能对User组进行升降级', Code.BadRequest)
    const res = await this.accountService.upgradeAccount(
      req.email,
      req.groupType,
    )
    return Resp.ok({ effectLines: res.count })
  }

  /**
   * @route `/account/downgrade`
   * @method POST
   * @role Admin
   * @reqbody `AccountUpDownGradeReq`（包含 `email` 与 `groupType`，且不可包含 `User` 组）
   * @resp `AccountUpDownGradeResp`（包含影响行数）
   * @description 降低目标账号的用户组
   */
  @Post('downgrade')
  @AllowUserGroup(UserGroupTypes.Admin)
  @ZodSerializerDto(AccountUpDownGradeResp)
  async downgradeAccount(
    @ZodBody({ zod: AccountUpDownGradeReq }) req: AccountUpDownGradeReqType,
  ) {
    if (req.groupType.includes(UserGroupTypes.User))
      return Resp.error('不能对User组进行升降级', Code.BadRequest)
    const res = await this.accountService.downgradeAccount(
      req.email,
      req.groupType,
    )
    return Resp.ok({ effectLines: res.count })
  }

  /**
   * @route `/account/disable`
   * @method POST
   * @role Admin
   * @reqbody `AccountDisableReq`（包含 `email`）
   * @resp `NullResp`（无内容）
   * @description 禁用指定账号
   */
  @Post('disable')
  @AllowUserGroup(UserGroupTypes.Admin)
  @ZodSerializerDto(NullResp)
  async disableAccount(
    @ZodBody({ zod: AccountDisableReq }) req: AccountDisableReqType,
  ) {
    await this.accountService.disableAccount(req.email)
    return Resp.ok()
  }

  /**
   * @route `/account/create`
   * @method POST
   * @role Admin
   * @reqbody `AccountCreateReq`（包含 `email`, `nickname`, `password`）
   * @resp `NullResp`（无内容）
   * @description 创建自定义账号
   */
  @Post('create')
  @AllowUserGroup(UserGroupTypes.Admin)
  @ZodSerializerDto(NullResp)
  async createAccount(
    @ZodBody({ zod: AccountCreateReq }) req: AccountCreateReqType,
  ) {
    await this.accountService.createCustomAccount(
      req.email,
      req.nickname,
      req.password,
    )
    return Resp.ok()
  }

  /**
   * @route `/account/change-password`
   * @method POST
   * @role User
   * @reqbody `AccountChangePasswordReq`（包含 `originPassword` 与 `password`）
   * @resp `NullResp`（无内容）
   * @description 修改当前登录用户的密码，需校验原密码
   */
  @Post('change-password')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(NullResp)
  async changePassword(
    @ZodBody({ zod: AccountChangePasswordReq })
    req: AccountChangePasswordReqType,
    @JwtAccount() account: AccountType,
  ) {
    const userFull = await this.accountService.getAccountWithVertify(
      account.email,
      req.originPassword,
    )
    if (!userFull) return Resp.error('原密码错误', Code.BadRequest)

    await this.accountService.changePassword(account.email, req.password)
    return Resp.ok()
  }

  /**
   * @route `/account/change-nickname`
   * @method POST
   * @role User
   * @reqbody `AccountChangeNicknameReq`（包含 `nickname`）
   * @resp `NullResp`（无内容）
   * @description 修改当前登录用户的昵称
   */
  @Post('change-nickname')
  @AllowUserGroup(UserGroupTypes.User)
  @ZodSerializerDto(NullResp)
  async changeNickname(
    @ZodBody({ zod: AccountChangeNicknameReq })
    req: AccountChangeNicknameReqType,
    @JwtAccount() account: AccountType,
  ): Promise<NullRespType> {
    await this.accountService.changeNickname(account.email, req.nickname)
    return Resp.ok()
  }
}
