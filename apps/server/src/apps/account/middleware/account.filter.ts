import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, Inject, Logger } from '@nestjs/common'
import { Code, Resp } from '@shared/data-transfer/_base'
import { JwtService } from '../jwt.service'
import { ExpressHttpHost } from '@/src/utils/nest-middleware'
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
    const httpHost = new ExpressHttpHost(host)
    const account = this.jwtService.account.jwtHttpRequest(httpHost.request)
    // 在请求阶段发生的记录为BadRequest
    httpHost.response.status(400).json(Resp.error(exception.message, Code.BadRequest))
    this.logger.log(`'${account.nickname}' visit ${httpHost.request.path} with Account Error(${exception.message})`)
  }
}
