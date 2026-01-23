import { ExpressHttpHost } from '@/src/utils/nest-middleware'
import { type ArgumentsHost, type ExceptionFilter, Logger } from '@nestjs/common'
import { Code, Resp } from '@shared/data-transfer/_base'

export class CommError extends Error {
  constructor(message?: string, readonly code: Code = Code.ServerError, readonly logLevel?: 'warn' | 'error') {
    super(message)
    this.name = 'CommError'
  }
}

export class CommErrorExceptionFilter implements ExceptionFilter<CommError> {
  private readonly logger = new Logger(CommErrorExceptionFilter.name)

  catch(exception: CommError, host: ArgumentsHost) {
    const httpHost = new ExpressHttpHost(host)
    httpHost.response.status(400).json(Resp.error(exception.message, exception.code))
    if(exception.logLevel === 'warn')
      this.logger.warn(exception.message)

    if(exception.logLevel === 'error')
      this.logger.error(exception.message)
  }
}
