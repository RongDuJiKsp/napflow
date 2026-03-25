import type { ExecutionContext } from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common'
import type { Request } from 'express'
import type { z } from 'zod'

export type ZodBodyConfig = {
  zod: z.ZodType;
}

// Create a decorator to parse the body of the request
export const ZodBody = createParamDecorator(
  ({ zod }: ZodBodyConfig, ctx: ExecutionContext) => {
    if(ctx.getType() === 'http') {
      const request = ctx.switchToHttp().getRequest<Request>()
      return zod.parse(request.body)
    }
    if(ctx.getType() === 'ws') {
      const data = ctx.switchToWs().getData()
      return zod.parse(data)
    }

    throw new Error('ZodBody can only be used in HTTP/WS context')
  },
)
