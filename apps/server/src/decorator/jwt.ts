import type { ExecutionContext } from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common'
import type z from 'zod'
import { jwtHeader } from '@/src/utils/jwt'

export type JwtBodyConfig = {
  zod: z.ZodType
}
export const JwtBody = createParamDecorator(({ zod }: JwtBodyConfig, ctx: ExecutionContext) => {
  const body = jwtHeader(ctx.switchToHttp().getRequest<Request>().headers)
  return zod.parse(body)
})
