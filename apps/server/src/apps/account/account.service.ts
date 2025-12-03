import { UserGroupTypes } from '@/src/prisma/generated/enums'
import { PrismaService } from '@/src/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import bcryptjs from 'bcryptjs'
import { AppConfigService } from '../app-config/app-config.service'
import type { AccountInfoListQueryType } from '@shared/data-transfer/account/account'
import type { UserWhereInput } from '@/src/prisma/generated/models'

@Injectable()
export class AccountService {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService, @Inject(AppConfigService) private readonly configService: AppConfigService) {}
  async getAccount(email: string) {
    return await this.prismaService.user.findFirst({
      where: {
        email,
      },
      include: {
        userGroup: { select: { groupType: true, createdAt: true } },
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
    return await this.prismaService.user.create({
      data: {
        email,
        nickname,
        password: hashedPassword,
      },
    })
  }

  async createCustomAccount(email: string, nickname: string, password: string) {
    const user = await this.createBlankAccount(email, nickname, password)
    if(!user)
      return null
    // 为用户创建默认用户组
    await this.prismaService.userGroup.create({
      data: {
        ofUser: user.email,
        groupType: UserGroupTypes.User,
      },
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
    await this.prismaService.userGroup.createMany({
      data: [
        { ofUser: user.email, groupType: UserGroupTypes.Admin },
        { ofUser: user.email, groupType: UserGroupTypes.User },
      ],
    })
    return user
  }

  async queryAccounts(query: AccountInfoListQueryType) {
    const userQuery: UserWhereInput[] = []

    if(query.isDisabled === true)
      userQuery.push({ disabledAt: { not: null } })
    else if(query.isDisabled === false)
      userQuery.push({ disabledAt: null })

    return await this.prismaService.user.findMany({
      where: {
        userGroup: {
          some: {
            groupType: {
              in: query.groups,
            },
          },
        },
        AND: userQuery,
      },
      include: {
        userGroup: { select: { groupType: true, createdAt: true } },
      },
    })
  }

  async downgradeAccount(email: string, groupType: UserGroupTypes[]) {
    if(groupType.includes(UserGroupTypes.User))
      throw new AccountError('不能降级User组')
    return await this.prismaService.userGroup.deleteMany({
      where: {
        ofUser: email,
        groupType: {
          in: groupType,
        },
      },
    })
  }

  async upgradeAccount(email: string, groupType: UserGroupTypes[]) {
    return await this.prismaService.userGroup.createMany({
      data: groupType.map(groupType => ({
        ofUser: email,
        groupType,
      })),
    })
  }

  async disableAccount(email: string) {
    return await this.prismaService.user.update({
      where: {
        email,
      },
      data: {
        disabledAt: new Date(),
      },
    })
  }
}
export class AccountError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AccountError'
  }
}
