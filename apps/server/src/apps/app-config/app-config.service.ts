import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { assertValue } from '@shared/utils/assert'
import * as crypto from 'node:crypto'
@Injectable()
export class AppConfigService {
  // 服务配置
  HOST_NAME: string
  PORT: string
  // 数据库服务配置
  MYSQL_DATABASE_URL: string
  // 默认账户配置
  ACC_ROOT_EMAIL: string
  ACC_ROOT_NICKNAME: string
  ACC_ROOT_PASSWORD: string
  // secret 配置
  JWT_SECRET_KEY: string

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.HOST_NAME = configService.get<string>('HOST_NAME') ?? '127.0.0.1'
    this.PORT = configService.get<string>('PORT') ?? '3000'
    this.ACC_ROOT_EMAIL = assertValue(configService.get<string>('ACC_ROOT_EMAIL'))
    this.ACC_ROOT_NICKNAME = assertValue(configService.get<string>('ACC_ROOT_NICKNAME'))
    this.ACC_ROOT_PASSWORD = assertValue(configService.get<string>('ACC_ROOT_PASSWORD'))
    // 如果没有设置JWT_SECRET_KEY，则每次启动时生成一个随机的JWT_SECRET_KEY
    this.JWT_SECRET_KEY
      = process.env.JWT_SECRET_KEY ?? crypto.randomBytes(32).toString('hex')
    this.MYSQL_DATABASE_URL = assertValue(configService.get<string>('MYSQL_DATABASE_URL'))
  }
}
