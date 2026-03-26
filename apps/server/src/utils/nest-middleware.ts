import type { ArgumentsHost, HttpStatus } from '@nestjs/common'
import type {
  ExecutionContext,
  HttpArgumentsHost,
} from '@nestjs/common/interfaces'
import type { Request, Response } from 'express'

export class ExpressHttpHost<
  Req extends Request = Request,
  Res extends Response = Response,
> {
  readonly httpArgumentHost: HttpArgumentsHost
  protected constructor(readonly argumentHost: ArgumentsHost) {
    this.httpArgumentHost = argumentHost.switchToHttp()
  }

  static tryParse<
    Req extends Request = Request,
    Res extends Response = Response,
  >(argumentHost: ArgumentsHost): ExpressHttpHost<Req, Res> | null {
    // 只处理HTTP请求，其他类型的请求（如WebSocket、RPC等）不受此Host限制
    if (argumentHost.getType() !== 'http') return null
    return new ExpressHttpHost(argumentHost)
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

export class ExpressExecContext<
  Req extends Request = Request,
  Res extends Response = Response,
> extends ExpressHttpHost<Req, Res> {
  protected constructor(readonly c: ExecutionContext) {
    super(c)
  }

  static tryParse<
    Req extends Request = Request,
    Res extends Response = Response,
  >(argumentHost: ExecutionContext): ExpressExecContext<Req, Res> | null {
    // 只处理HTTP请求，其他类型的请求（如WebSocket、RPC等）不受此Host限制
    if (argumentHost.getType() !== 'http') return null
    return new ExpressExecContext(argumentHost)
  }
}
