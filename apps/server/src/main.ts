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
  logger.log('环境变量配置：')
  console.table({
    NODE_ENV,
    HOST_NAME: configServer.HOST_NAME,
    PORT: configServer.PORT,
    ACC_ROOT_EMAIL: configServer.ACC_ROOT_EMAIL,
    ACC_ROOT_NICKNAME: configServer.ACC_ROOT_NICKNAME,
    ACC_ROOT_PASSWORD: configServer.ACC_ROOT_PASSWORD,
    JWT_SECRET_KEY: configServer.JWT_SECRET_KEY,
  })

  // 启动服务
  const hostname = configServer.HOST_NAME
  const port = configServer.PORT
  await app.listen(
    port,
    hostname,
    () => {
      logger.log(`Server is running on ${hostname}:${port}`)
    },
  )
}
bootstrap()
