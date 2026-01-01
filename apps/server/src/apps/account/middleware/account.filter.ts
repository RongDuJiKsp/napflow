import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, Inject, Logger } from '@nestjs/common'
import { Code, Resp } from '@shared/data-transfer/_base'
import type { Request, Response } from 'express'
import { JwtService } from '../jwt.service'
export class AccountError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AccountError'
  }
}

@Catch(AccountError)
export class AccountExceptionFilter implements ExceptionFilter<AccountError> {
  private readonly logger = new Logger(AccountExceptionFilter.name)

  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {

  }

  catch(exception: AccountError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const account = this.jwtService.account.jwtHttpRequest(request)
    // 在请求阶段发生的记录为BadRequest
    response.status(400).json(Resp.error(exception.message, Code.BadRequest))
    this.logger.log(`'${account.nickname}' visit ${request.path} with Account Error(${exception.message})`)
  }
}
