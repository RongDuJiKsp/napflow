import {
  Controller,
  Get,
  Inject,
  ParseArrayPipe,
  ParseBoolPipe,
  Query,
} from '@nestjs/common'
import { Resp } from '@shared/data-transfer/_base'
import {
  ZodCheckAccountInfoListQuery,
  ZodCheckAccountInfoListResp,
  ZodCheckAccountInfoResp,
} from '@shared/data-transfer/account/account'
import { ZodSerializerDto } from 'nestjs-zod'
import { AccountService } from './account.service'
import { AllowUserGroup, JwtAccount } from '@/src/decorator/account'
import type { Account } from '@shared/common/account/base'
import { UserRole } from '@shared/common/account/core'

/**
 * @route `/account`
 * @description 处理账号查询操作。
 */
@Controller('account')
export class AccountQueryController {
  constructor(
    @Inject(AccountService) private readonly accountService: AccountService,
  ) {}

  /**
   * @route `/account/query/list`
   * @method GET
   * @description 返回账号列表，支持按是否禁用和角色筛选
   */
  @Get('query/list')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckAccountInfoListResp)
  async getAccount(
    @Query('isDisabled', new ParseBoolPipe({ optional: true }))
    isDisabled?: boolean,
    @Query('roles', new ParseArrayPipe({ optional: true })) roles?: string[],
  ) {
    const accounts = await this.accountService.queryAccounts(
      ZodCheckAccountInfoListQuery.parse({
        isDisabled,
        roles,
      }),
    )
    return Resp.ok(accounts)
  }

  /**
   * @route `/account/query/cur`
   * @method GET
   * @description 返回当前登录用户的详情
   */
  @Get('query/cur')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckAccountInfoResp)
  async getCurAccount(@JwtAccount() account: Account) {
    const curAccount = await this.accountService.getAccount(account.email)
    if (!curAccount) throw new Error('签发了token的用户不存在')
    return Resp.ok(curAccount)
  }

  /**
   * @route `/account/query/info`
   * @method GET
   * @description 根据 email 返回指定用户信息
   */
  @Get('query/info')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckAccountInfoResp)
  async getAccountInfo(@Query('email') email: string) {
    const curAccount = await this.accountService.getAccount(email)
    return Resp.ok(curAccount)
  }
}
