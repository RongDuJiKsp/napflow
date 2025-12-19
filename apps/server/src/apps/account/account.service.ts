import { Inject, Injectable } from '@nestjs/common'
import bcryptjs from 'bcryptjs'
import { AppConfigService } from '../app-config/app-config.service'
import type { AccountInfoListQueryType } from '@shared/data-transfer/account/account'
import { TypeOrmService } from '@/src/db/typeorm.service'
import type { UserEntity } from '@/src/db/models/account.entity'
import { UserGroupTypes } from '@/src/db/models/account.entity'
import type { FindOptionsWhere } from 'typeorm'
import { In, IsNull, Not } from 'typeorm'

@Injectable()
export class AccountService {
  constructor(@Inject(TypeOrmService) private readonly db: TypeOrmService, @Inject(AppConfigService) private readonly configService: AppConfigService) {}
  async getAccount(email: string) {
    return await this.db.user.findOne({
      where: {
        email,
      },
      relations: {
        userGroups: true,
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
      return null
    const hashedPassword = await bcryptjs.hash(password, 10)
    return await this.db.user.save({
      email,
      nickname,
      password: hashedPassword,
    })
  }

  async createCustomAccount(email: string, nickname: string, password: string) {
    const user = await this.createBlankAccount(email, nickname, password)
    if(!user)
      return null
    // 为用户创建默认用户组
    await this.db.userGroup.create({
      ofUser: user.email,
      groupType: UserGroupTypes.User,
    })
    return user
  }

  async checkAndCreateRootAccount() {
    const rootAccount = await this.getAccount(this.configService.envs.ACC_ROOT_EMAIL)
    if(rootAccount)
      return rootAccount
    const user = await this.createBlankAccount(this.configService.envs.ACC_ROOT_EMAIL, this.configService.envs.ACC_ROOT_NICKNAME, this.configService.envs.ACC_ROOT_PASSWORD)
    if(!user)
      throw new AccountError('创建根账户失败')
    // 为根账户创建管理员和用户组
    await this.db.userGroup.save([
      { ofUser: user.email, groupType: UserGroupTypes.Admin },
      { ofUser: user.email, groupType: UserGroupTypes.User },
    ])
    return user
  }

  async queryAccounts(query: AccountInfoListQueryType) {
    const userQuery: FindOptionsWhere<UserEntity> = {}

    if(query.isDisabled === true)
      userQuery.disabledAt = Not(IsNull())
    else if(query.isDisabled === false)
      userQuery.disabledAt = IsNull()
    if(query.groups) {
      userQuery.userGroups = {
        groupType: In(query.groups),
      }
    }

    return await this.db.user.find({
      where: userQuery,
      relations: {
        userGroups: true,
      },
    })
  }

  async downgradeAccount(email: string, groupType: UserGroupTypes[]) {
    if(groupType.includes(UserGroupTypes.User))
      throw new AccountError('不能降级User组')
    return await this.db.userGroup.delete({
      ofUser: email,
      groupType: In(groupType),
    })
  }

  async upgradeAccount(email: string, groupType: UserGroupTypes[]) {
    return await this.db.userGroup.create(groupType.map(groupType => ({
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

export class AccountError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AccountError'
  }
}
