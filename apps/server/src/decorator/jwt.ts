import type { PipeTransform } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import type z from 'zod'
import type { JwtPayload, JwtService } from '../apps/account/jwt.service'
import { ReqHeader } from './common'
import { ZodValidationPipe } from 'nestjs-zod'

@Injectable()
export class JwtTokenPipe<R extends JwtPayload> implements PipeTransform<Headers, R> {
  constructor(private readonly jwtService: JwtService) {
  }

  transform(value: Headers) {
    return this.jwtService.jwtHeader<R>(value)
  }
}

export type JwtBodyConfig = {
  zod?: z.ZodType
}

export const JwtBody = ({ zod }: JwtBodyConfig) => ReqHeader(JwtTokenPipe, zod ? new ZodValidationPipe(zod) : undefined)
