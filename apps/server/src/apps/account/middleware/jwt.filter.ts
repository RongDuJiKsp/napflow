import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpStatus, Logger } from '@nestjs/common'
import { Code, Resp } from '@shared/data-transfer/_base'
import type { Request, Response } from 'express'

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
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    // 在请求阶段发生的记录为UnAuth
    response.status(HttpStatus.UNAUTHORIZED).json(Resp.error(exception.message, Code.Unauthorized))
    this.logger.log(`endpoint ${request.path} visited with unauth(${exception.message})`)
  }
}
