import type { PipeTransform } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common'
import type z from 'zod'
import type { JwtPayload } from '../apps/account/jwt.service'
import { JwtService } from '../apps/account/jwt.service'
import { ZodValidationPipe } from 'nestjs-zod'
import type { Request } from 'express'
import { HttpReq } from './common'

@Injectable()
export class JwtTokenPipe<R extends JwtPayload> implements PipeTransform<
  Request,
  R
> {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  transform(value: Request) {
    return this.jwtService.jwtHttpRequest<R>(value)
  }
}

export type JwtBodyConfig = {
  zod?: z.ZodType;
}

export const JwtBody = ({ zod }: JwtBodyConfig) =>
  HttpReq(JwtTokenPipe, zod ? new ZodValidationPipe(zod) : undefined)
