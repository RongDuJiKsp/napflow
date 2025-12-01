import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { NODE_ENV } from './config/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')
  // 加载配置
  const configServer = app.get<ConfigService>(ConfigService)
  logger.log(`Envs:
    NODE_ENV: ${NODE_ENV}
    HOST_NAME: ${configServer.get<string>('HOST_NAME')}
    PORT: ${configServer.get<string>('PORT')}\
    `)

  const hostname = configServer.get<string>('HOST_NAME') ?? '127.0.0.1'
  const port = configServer.get<string>('PORT') ?? 3000

  // 启动服务
  await app.listen(
    port,
    hostname,
    () => {
      logger.log(`Server is running on ${hostname}:${port}`)
    },
  )
}
bootstrap()
