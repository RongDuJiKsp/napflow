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
    const ctx = new ExpressHttpHost(host)
    // 在请求阶段发生的记录为UnAuth
    ctx.response
      .status(HttpStatus.UNAUTHORIZED)
      .json(Resp.error(exception.message, Code.Unauthorized))
    this.logger.log(
      `endpoint ${ctx.request.path} visited with unauth(${exception.message})`,
    )
  }
}

@Catch(JsonWebTokenError)
export class JsonWebTokenErrorFilter implements ExceptionFilter<JsonWebTokenError> {
  private readonly logger = new Logger(VaildJwtErrorFilter.name)

  catch(exception: JsonWebTokenError, host: ArgumentsHost) {
    const ctx = new ExpressHttpHost(host)
    // 在请求阶段发生的记录为UnAuth
    ctx.response
      .status(HttpStatus.UNAUTHORIZED)
      .json(Resp.error('Token已过期', Code.Unauthorized))
  }
}
