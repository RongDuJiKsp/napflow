import { Injectable } from '@nestjs/common'
import * as crypto from 'node:crypto'
import z from 'zod'
export const AppConfigEnvShema = z.object({
  // 服务配置
  HOST_NAME: z.string().default('localhost'),
  PORT: z.string().default('3000'),
  // 数据库服务配置
  MYSQL_DATABASE_URL: z.string(),
  // 默认账户配置
  ACC_ROOT_EMAIL: z.string(),
  ACC_ROOT_NICKNAME: z.string(),
  ACC_ROOT_PASSWORD: z.string(),
  // secret 配置
  JWT_SECRET_KEY: z.string().default(crypto.randomBytes(32).toString('hex')),
})
@Injectable()
export class AppConfigService {
  envs: z.infer<typeof AppConfigEnvShema>
  constructor() {
    this.envs = AppConfigEnvShema.parse(process.env)
  }
}
