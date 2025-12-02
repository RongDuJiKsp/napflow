import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'
import { NODE_ENV } from './config/env'
import { AppConfigService } from './apps/app-config/app-config.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')
  // 加载配置
  const configServer = app.get<AppConfigService>(AppConfigService)
  logger.log('服务Provider配置：')
  console.table({
    NODE_ENV,
    HOST_NAME: configServer.envs.HOST_NAME,
    PORT: configServer.envs.PORT,
    ACC_ROOT_EMAIL: configServer.envs.ACC_ROOT_EMAIL,
    ACC_ROOT_NICKNAME: configServer.envs.ACC_ROOT_NICKNAME,
    ACC_ROOT_PASSWORD: configServer.envs.ACC_ROOT_PASSWORD,
    JWT_SECRET_KEY: configServer.envs.JWT_SECRET_KEY,
  })

  // 启动服务
  const hostname = configServer.envs.HOST_NAME
  const port = configServer.envs.PORT
  await app.listen(
    port,
    hostname,
    () => {
      logger.log(`Server is running on ${hostname}:${port}`)
    },
  )
}
bootstrap()
