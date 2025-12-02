import { Inject, Injectable } from '@nestjs/common'
import jwt from 'jsonwebtoken'
import type zod from 'zod'
import { AppConfigService } from '../app-config/app-config.service'
import type { AccountType } from '@shared/data-transfer/account/account'
import { Account } from '@shared/data-transfer/account/account'
import { ConfigService } from '@nestjs/config'

export type JwtPayload = object | string | Buffer<ArrayBufferLike>
export class VaildJwtError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VaildJwtError'
  }
}
export class JwtOperator<T extends JwtPayload> {
  constructor(private readonly secret: string, private readonly zod: zod.ZodType<T>) {
  }

  jwtSign(payload: T, options?: jwt.SignOptions) {
    return jwt.sign(this.zod.parse(payload), this.secret, options)
  }

  jwtVerify(token: string, options?: jwt.VerifyOptions) {
    return this.zod.parse(jwt.verify(token, this.secret, options))
  }

  jwtHeader(header: Headers, options?: jwt.VerifyOptions) {
    const authHeader = header.get('Authorization')?.split(' ')[1]
    if(!authHeader)
      throw new VaildJwtError('Authorization header is missing')

    return this.zod.parse(jwt.verify(authHeader, this.secret, options))
  }
}

@Injectable()
export class JwtService {
  account: JwtOperator<AccountType>

  constructor(@Inject(AppConfigService) private readonly configService: AppConfigService) {
    this.account = new JwtOperator(this.configService.JWT_SECRET_KEY, Account)
  }

  jwtHeader<U extends JwtPayload = JwtPayload>(header: Headers, options?: jwt.VerifyOptions): U {
    const authHeader = header.get('Authorization')?.split(' ')[1]
    if(!authHeader)
      throw new VaildJwtError('Authorization header is missing')

    return jwt.verify(authHeader, this.configService.JWT_SECRET_KEY, options) as U
  }
}
