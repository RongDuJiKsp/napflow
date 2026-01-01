import type { ArgumentsHost, HttpStatus } from '@nestjs/common'
import type { ExecutionContext, HttpArgumentsHost } from '@nestjs/common/interfaces'
import type { Request, Response } from 'express'

export class ExpressHttpHost<Req extends Request = Request, Res extends Response = Response> {
  readonly httpArgumentHost: HttpArgumentsHost
  constructor(readonly argumentHost: ArgumentsHost) {
    this.httpArgumentHost = argumentHost.switchToHttp()
  }

  get request(): Req {
    return this.httpArgumentHost.getRequest<Req>()
  }

  get response(): Res {
    return this.httpArgumentHost.getResponse<Res>()
  }

  // 约束到StatusCode枚举
  sendWithCode(code: HttpStatus) {
    return this.response.status(code)
  }
}

export class ExpressExecContext<Req extends Request = Request, Res extends Response = Response> extends ExpressHttpHost<Req, Res> {
  constructor(readonly c: ExecutionContext) {
    super(c)
  }
}
