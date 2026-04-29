import { ExpressHttpHost } from '@/src/utils/nest-middleware'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { Code, Resp } from '@shared/data-transfer/_base'

export class BotCoreRuntimeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BotCoreRuntimeError'
  }
}

export class BotCoreRuntimeExceptionFilter implements ExceptionFilter<BotCoreRuntimeError> {
  private readonly logger = new Logger(BotCoreRuntimeExceptionFilter.name)

  catch(exception: BotCoreRuntimeError, host: ArgumentsHost) {
    const httpHost = ExpressHttpHost.tryParse(host)

    if (httpHost) {
      this.catchHttp(exception, httpHost)
      return
    }

    this.catchOther(exception, host)
  }

  private catchHttp(exception: BotCoreRuntimeError, httpHost: ExpressHttpHost) {
    httpHost.response
      .status(400)
      .json(Resp.error(exception.message, Code.BadRequest))
    this.logger.log(
      `endpoint visit ${httpHost.request.path} with BotCoreRuntime Error(${exception.message})`,
    )
  }

  private catchOther(exception: BotCoreRuntimeError, host: ArgumentsHost) {
    this.logger.warn(
      `BotCoreRuntimeExceptionFilter caught an unhandled(${host.getType()}) exception: ${exception.message}`,
    )
  }
}
