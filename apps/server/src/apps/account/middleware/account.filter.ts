import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch } from '@nestjs/common'
import { Code, Resp } from '@shared/data-transfer/_base'
import type { Response } from 'express'
export class AccountError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AccountError'
  }
}

@Catch(AccountError)
export class AccountExceptionFilter implements ExceptionFilter<AccountError> {
  catch(exception: AccountError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    // 在请求阶段发生的记录为BadRequest
    response.status(400).json(Resp.error(exception.message, Code.BadRequest))
  }
}
