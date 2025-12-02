import { Injectable, Logger } from '@nestjs/common'
import * as crypto from 'node:crypto'
import z, { ZodError } from 'zod'
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

  private readonly logger = new Logger(AppConfigService.name)
  constructor() {
    // init env
    try{
      this.envs = AppConfigEnvShema.parse(process.env)
    }
    catch (e) {
      this.logger.fatal('解析App环境变量配置时发生异常')
      if(e instanceof ZodError)
        this.logger.fatal(`\n${z.prettifyError(e)}`)

      throw e
    }
  }
}
