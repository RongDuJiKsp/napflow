import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, Logger } from '@nestjs/common'
import z, { ZodError } from 'zod'
import { Code, Resp } from '@shared/data-transfer/_base'
import { ZodSerializationException } from 'nestjs-zod'
import { ExpressHttpHost } from '@/src/utils/nest-middleware'

@Catch(ZodError)
export class ZodErrExceptionFilter implements ExceptionFilter<ZodError> {
  private readonly logger = new Logger(ZodErrExceptionFilter.name)

  catch(exception: ZodError, host: ArgumentsHost) {
    const httpHost = ExpressHttpHost.tryParse(host)

    if (httpHost) {
      this.catchHttp(exception, httpHost)
      return
    }

    this.catchOther(exception, host)
  }

 private catchHttp(exception: ZodError, httpHost: ExpressHttpHost) {
    const issuesMsg = exception.issues
      .map(i => `${i.path.join('::')}has error:${i.message}`)
      .join(';')
    const errMsg = `ZodValidError: ${issuesMsg}`
    // 在请求阶段发生的记录为BadRequest
    httpHost.response.status(400).json(Resp.error(errMsg, Code.BadRequest))
  }

 private catchOther(exception: ZodError, host: ArgumentsHost) {
    this.logger.warn(
      `ZodErrExceptionFilter caught an unhandled(${host.getType()}) exception: ${exception.message}`,
    )
  }
}

@Catch(ZodSerializationException)
export class ZodSerializationExceptionFilter implements ExceptionFilter<ZodSerializationException> {
  private readonly logger = new Logger(ZodSerializationExceptionFilter.name)

  catch(exception: ZodSerializationException, host: ArgumentsHost) {
    const httpHost = ExpressHttpHost.tryParse(host)

    if (!httpHost) {
      this.catchOther(exception, host)
      return
    }

    this.catchHttp(exception, httpHost)
  }

  catchHttp(exception: ZodSerializationException, httpHost: ExpressHttpHost) {
    this.logger.error(
      `Controller(${httpHost.request.path})响应校验失败 \n${z.prettifyError(exception.getZodError() as ZodError)}`,
    )
    httpHost.response
      .status(400)
      .json(Resp.error('Controller响应校验失败', Code.ServerError))
  }

private  catchOther(exception: ZodSerializationException, host: ArgumentsHost) {
    this.logger.warn(
      `ZodSerializationExceptionFilter caught an unhandled(${host.getType()}) exception: ${exception.message}`,
    )
  }
}
