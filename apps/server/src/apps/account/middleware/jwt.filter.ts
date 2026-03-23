import { ExpressHttpHost } from '@/src/utils/nest-middleware'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpStatus, Logger } from '@nestjs/common'
import { Code, Resp } from '@shared/data-transfer/_base'
import { JsonWebTokenError } from 'jsonwebtoken'

export class VaildJwtError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VaildJwtError'
  }
}
@Catch(VaildJwtError)
export class VaildJwtErrorFilter implements ExceptionFilter<VaildJwtError> {
  private readonly logger = new Logger(VaildJwtErrorFilter.name)

  catch(exception: VaildJwtError, host: ArgumentsHost) {
    const httpHost = ExpressHttpHost.tryParse(host)

    if (httpHost) {
      this.catchHttp(exception, httpHost)
      return
    }

    this.logger.warn(
      `VaildJwtErrorFilter caught an exception: ${exception.message}`,
    )
  }

  catchHttp(exception: VaildJwtError, httpHost: ExpressHttpHost) {
    // 在请求阶段发生的记录为UnAuth
    httpHost.response
      .status(HttpStatus.UNAUTHORIZED)
      .json(Resp.error(exception.message, Code.Unauthorized))
    this.logger.log(
      `endpoint ${httpHost.request.path} visited with unauth(${exception.message})`,
    )
  }
}

@Catch(JsonWebTokenError)
export class JsonWebTokenErrorFilter implements ExceptionFilter<JsonWebTokenError> {
  private readonly logger = new Logger(JsonWebTokenErrorFilter.name)

  catch(exception: JsonWebTokenError, host: ArgumentsHost) {
    const httpHost = ExpressHttpHost.tryParse(host)

    if (httpHost) {
      this.catchHttp(exception, httpHost)
      return
    }

    this.logger.warn(
      `JsonWebTokenErrorFilter caught an exception: ${exception.message}`,
    )
  }

  catchHttp(exception: JsonWebTokenError, httpHost: ExpressHttpHost) {
    // 在请求阶段发生的记录为UnAuth
    httpHost.response
      .status(HttpStatus.UNAUTHORIZED)
      .json(Resp.error('Token已过期', Code.Unauthorized))
    this.logger.log(
      `endpoint ${httpHost.request.path} visited with token error(${exception.message})`,
    )
  }
}
