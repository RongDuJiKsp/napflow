import { AllowUserGroup } from '@/src/decorator/account'
import { ZodBody } from '@/src/decorator/zod'
import { UserRole } from '@shared/common/account/core'
import { Code, Resp, ZodCheckNullResp } from '@shared/data-transfer/_base'
import type {
  AccountCreateReq,
  AccountDisableReq,
  AccountUpDownGradeReq,
} from '@shared/data-transfer/account/account'
import {
  ZodCheckAccountCreateReq,
  ZodCheckAccountDisableReq,
  ZodCheckAccountUpDownGradeReq,
  ZodCheckAccountUpDownGradeResp,
} from '@shared/data-transfer/account/account'
import { Controller, Inject, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { AccountService } from './account.service'

/**
 * @route `/account`
 * @description 处理账号管理动作（创建、禁用、升降级）。
 */
@Controller('account')
export class AccountActionController {
  constructor(
    @Inject(AccountService) private readonly accountService: AccountService,
  ) {}

  /**
   * @route `/account/action/upgrade`
   * @method POST
   * @description 提升目标账号的用户组
   */
  @Post('action/upgrade')
  @AllowUserGroup(UserRole.Admin)
  @ZodSerializerDto(ZodCheckAccountUpDownGradeResp)
  async upgradeAccount(
    @ZodBody({ zod: ZodCheckAccountUpDownGradeReq }) req: AccountUpDownGradeReq,
  ) {
    if (req.groupType.includes(UserRole.User))
      return Resp.error('不能对User组进行升降级', Code.Forbidden)
    const res = await this.accountService.upgradeAccount(
      req.email,
      req.groupType,
    )
    if (!res.length) return Resp.error('不存在满足条件的组', Code.NotFound)

    return Resp.ok({ effectLines: res.length })
  }

  /**
   * @route `/account/action/downgrade`
   * @method POST
   * @description 降低目标账号的用户组
   */
  @Post('action/downgrade')
  @AllowUserGroup(UserRole.Admin)
  @ZodSerializerDto(ZodCheckAccountUpDownGradeResp)
  async downgradeAccount(
    @ZodBody({ zod: ZodCheckAccountUpDownGradeReq }) req: AccountUpDownGradeReq,
  ) {
    if (req.groupType.includes(UserRole.User))
      return Resp.error('不能对User组进行升降级', Code.Forbidden)
    const res = await this.accountService.downgradeAccount(
      req.email,
      req.groupType,
    )
    if (!res.affected) return Resp.error('不存在满足条件的组', Code.NotFound)

    return Resp.ok({ effectLines: res.affected })
  }

  /**
   * @route `/account/action/disable`
   * @method POST
   * @description 禁用指定账号
   */
  @Post('action/disable')
  @AllowUserGroup(UserRole.Admin)
  @ZodSerializerDto(ZodCheckNullResp)
  async disableAccount(
    @ZodBody({ zod: ZodCheckAccountDisableReq }) req: AccountDisableReq,
  ) {
    const result = await this.accountService.disableAccount(req.email)
    if (!result?.affected) return Resp.error('不存在满足条件的用户', Code.NotFound)

    return Resp.ok()
  }

  /**
   * @route `/account/action/create`
   * @method POST
   * @description 创建自定义账号
   */
  @Post('action/create')
  @AllowUserGroup(UserRole.Admin)
  @ZodSerializerDto(ZodCheckNullResp)
  async createAccount(
    @ZodBody({ zod: ZodCheckAccountCreateReq }) req: AccountCreateReq,
  ) {
    if (
      !(await this.accountService.createCustomAccount(
        req.email,
        req.nickname,
        req.password,
      ))
    )
      return Resp.error('用户已存在', Code.BadRequest)

    return Resp.ok()
  }
}
