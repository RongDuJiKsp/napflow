import type { ExecutionContext } from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common'
import type { Request } from 'express'
import type { z } from 'zod'

export type ZodBoodyConfig = {
  zod: z.ZodType;
}
// Create a decorator to parse the body of the request
export const ZodBody = createParamDecorator(
  ({ zod }: ZodBoodyConfig, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    return zod.parse(request.body)
  },
)
