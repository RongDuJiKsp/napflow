import { Inject, Injectable } from '@nestjs/common'
import bcryptjs from 'bcryptjs'
import { AppConfigService } from '../app-config/app-config.service'
import type { AccountInfoListQuery } from '@shared/data-transfer/account/account'
import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import type { UserEntity } from '@/src/apps/db/models/account.entity'
import type { FindOptionsWhere } from 'typeorm'
import { In, IsNull, Not } from 'typeorm'
import { UserRole } from '@shared/common/account/base'
import { AccountError } from './middleware/account.filter'

@Injectable()
export class AccountService {
  constructor(@Inject(TypeOrmService) private readonly db: TypeOrmService, @Inject(AppConfigService) private readonly configService: AppConfigService) {}
  async getAccount(email: string) {
    return await this.db.user.findOne({
      where: {
        email,
      },
      relations: {
        userGroup: true,
      },
    })
  }

  async getAccountWithVertify(email: string, password: string) {
    const user = await this.getAccount(email)
    if(!user)
      return null

    if(!await bcryptjs.compare(password, user.password))
      return null

    return user
  }

  async createBlankAccount(email: string, nickname: string, password: string) {
    if(await this.getAccount(email))
      throw new AccountError('用户已存在')
    const hashedPassword = await bcryptjs.hash(password, 10)
    return await this.db.user.save({
      email,
      nickname,
      password: hashedPassword,
    })
  }

  async createCustomAccount(email: string, nickname: string, password: string) {
    const user = await this.createBlankAccount(email, nickname, password)
    // 为用户创建默认用户组
    await this.db.userGroup.save({
      ofUser: user.email,
      groupType: UserRole.User,
    })
    return user
  }

  async checkAndCreateRootAccount() {
    const rootAccount = await this.getAccount(this.configService.envs.ACC_ROOT_EMAIL)
    if(rootAccount)
      return { exist: true, acc: rootAccount }
    const user = await this.createBlankAccount(this.configService.envs.ACC_ROOT_EMAIL, this.configService.envs.ACC_ROOT_NICKNAME, this.configService.envs.ACC_ROOT_PASSWORD)
    if(!user)
      throw new AccountError('创建根账户失败')
    // 为根账户创建管理员和用户组
    await this.db.userGroup.save([
      { ofUser: user.email, groupType: UserRole.Admin },
      { ofUser: user.email, groupType: UserRole.User },
    ])
    return { exist: false, acc: user }
  }

  // 将根账户与配置中的根账户同步
  async syncRootAccount() {
    // 当根账户不存在时创建 否则拿到账户
    const { acc: rootAccount, exist: accExists } = await this.checkAndCreateRootAccount()
    // 验证账户密码是否一致 不一致时更新密码
    if(await bcryptjs.compare(this.configService.envs.ACC_ROOT_PASSWORD, rootAccount.password))
      return { acc: rootAccount, accExists, updated: false }
    await this.changePassword(this.configService.envs.ACC_ROOT_EMAIL, this.configService.envs.ACC_ROOT_PASSWORD)
    return { acc: rootAccount, accExists, updated: true }
  }

  async queryAccounts(query: AccountInfoListQuery) {
    const userQuery: FindOptionsWhere<UserEntity> = {}

    if(query.isDisabled === true)
      userQuery.disabledAt = Not(IsNull())
    else if(query.isDisabled === false)
      userQuery.disabledAt = IsNull()
    if(query.groups) {
      userQuery.userGroup = {
        groupType: In(query.groups),
      }
    }

    return await this.db.user.find({
      where: userQuery,
      relations: {
        userGroup: true,
      },
    })
  }

  async downgradeAccount(email: string, groupType: UserRole[]) {
    if(groupType.includes(UserRole.User))
      throw new AccountError('不能降级User组')

    // 不能让系统没有管理员
    const admins = await this.db.userGroup.find({
      select: {
        ofUser: true,
      },
      where: {
        groupType: UserRole.Admin,
      },
    }).then(res => res.map(item => item.ofUser))
    if(admins.length <= 1 && (!admins[0] || admins[0] === email))
      throw new AccountError('不能降级最后一个管理员')

    return await this.db.userGroup.delete({
      ofUser: email,
      groupType: In(groupType),
    })
  }

  async upgradeAccount(email: string, groupType: UserRole[]) {
    return await this.db.userGroup.save(groupType.map(groupType => ({
      ofUser: email,
      groupType,
    })))
  }

  async disableAccount(email: string) {
    return await this.db.user.softDelete({ email })
  }

  async enableAccount(email: string) {
    return await this.db.user.update({ email }, { disabledAt: null })
  }

  async changePassword(email: string, password: string) {
    const hashedPassword = await bcryptjs.hash(password, 10)
    return await this.db.user.update({ email }, { password: hashedPassword })
  }

  async changeNickname(email: string, nickname: string) {
    return await this.db.user.update({ email }, { nickname })
  }
}
