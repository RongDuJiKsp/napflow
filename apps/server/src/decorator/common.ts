import type { ExecutionContext } from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common'

export const ReqHeader = createParamDecorator((_v: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>()
  return request.headers
})
