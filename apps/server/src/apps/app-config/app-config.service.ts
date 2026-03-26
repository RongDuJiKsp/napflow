import { Injectable, Logger } from '@nestjs/common'
import * as crypto from 'node:crypto'
import z, { ZodError } from 'zod'
export const AppConfigEnvShema = z.object({
  // 服务配置
  HOST_NAME: z.string().min(1).catch('localhost'),
  PORT: z.string().min(1).catch('8848'),
  // 数据库服务配置
  MYSQL_USERNAME: z.string().min(1),
  MYSQL_PWD: z.string().min(1),
  MYSQL_HOSTPORT: z.string().min(1).catch('localhost:3306'),
  MYSQL_DATABASE: z.string().min(1).catch('napflow_db'),
  // 默认账户配置
  ACC_ROOT_EMAIL: z.email().catch('root@napflow.com'),
  ACC_ROOT_NICKNAME: z.string().min(1).catch('rootUser'),
  ACC_ROOT_PASSWORD: z.string().min(1).catch('root'),
  SYNC_ROOT_ACCOUNT_FLAG: z.string().optional(),
  // secret 配置
  JWT_SECRET_KEY: z.string().min(1).catch(() => crypto.randomBytes(32).toString('hex')),
})
@Injectable()
export class AppConfigService {
  envs: z.infer<typeof AppConfigEnvShema>

  private readonly logger = new Logger(AppConfigService.name)
  constructor() {
    // init env
    try {
      this.envs = AppConfigEnvShema.parse(process.env)
    }
    catch (e) {
      this.logger.fatal('解析App环境变量配置时发生异常')
      if (e instanceof ZodError) this.logger.fatal(`\n${z.prettifyError(e)}`)

      throw e
    }
  }

  get MYSQL_CONNECT_URL() {
    return `mysql://${this.envs.MYSQL_USERNAME}:${this.envs.MYSQL_PWD}@${this.envs.MYSQL_HOSTPORT}/${this.envs.MYSQL_DATABASE}`
  }

  get sqlConnConfig() {
    const [host, portString] = this.envs.MYSQL_HOSTPORT.split(':')
    return {
      host,
      port: Number(portString),
      user: this.envs.MYSQL_USERNAME,
      password: this.envs.MYSQL_PWD,
    }
  }
}
