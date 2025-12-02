import { UserGroupTypes } from '@/src/prisma/generated/enums'
import type { PrismaService } from '@/src/prisma/prisma-service'
import { Injectable } from '@nestjs/common'
import bcryptjs from 'bcryptjs'
import type { AppConfigService } from '../app-config/app-config.service'

@Injectable()
export class AccountService {
  constructor(private prismaService: PrismaService, private configService: AppConfigService) {}
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
    const rootAccount = await this.getAccount(this.configService.ACC_ROOT_EMAIL)
    if(rootAccount)
      return rootAccount
    const user = await this.createBlankAccount(this.configService.ACC_ROOT_EMAIL, this.configService.ACC_ROOT_NICKNAME, this.configService.ACC_ROOT_PASSWORD)
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
}
export class AccountError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AccountError'
  }
}
