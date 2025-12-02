import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, Logger } from '@nestjs/common'
import { ZodError } from 'zod'
import type { Response } from 'express'
import { Code, Resp } from '@shared/data-transfer/_base'

@Catch(ZodError)
export class ZodErrExceptionFilter implements ExceptionFilter<ZodError> {
  private readonly logger = new Logger(ZodErrExceptionFilter.name)
  catch(exception: ZodError, host: ArgumentsHost) {
    const issuesMsg = exception.issues.map(i => `${i.path.join('::')}has error:${i.message}`).join(';')
    const errMsg = `ZodValidError: ${issuesMsg}`

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    // 在请求阶段发生的记录为BadRequest
    response.status(400).json(Resp.error(errMsg, Code.BadRequest))
  }
}
