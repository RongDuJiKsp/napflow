import { Inject, Injectable } from '@nestjs/common'
import jwt from 'jsonwebtoken'
import type zod from 'zod'
import { AppConfigService } from '../app-config/app-config.service'
import type { Account } from '@shared/common/account/base'
import { ZodCheckAccount } from '@shared/common/account/base'
import type { Request } from 'express'
import { VaildJwtError } from './middleware/jwt.filter'

export type JwtPayload = object | string | Buffer<ArrayBufferLike>

export class JwtOperator<T extends JwtPayload> {
  constructor(
    private readonly secret: string,
    private readonly zod: zod.ZodType<T>,
  ) {}

  jwtSign(payload: T, options?: jwt.SignOptions) {
    return jwt.sign(this.zod.parse(payload), this.secret, options)
  }

  jwtVerify(token: string, options?: jwt.VerifyOptions) {
    return this.zod.parse(jwt.verify(token, this.secret, options))
  }

  jwtHttpRequest(req: Request, options?: jwt.VerifyOptions) {
    const authHeader = req.get('Authorization')?.split(' ')[1]
    if (!authHeader) throw new VaildJwtError('Authorization header is missing')

    return this.zod.parse(jwt.verify(authHeader, this.secret, options))
  }
}

@Injectable()
export class JwtService {
  account: JwtOperator<Account>

  constructor(
    @Inject(AppConfigService) private readonly configService: AppConfigService,
  ) {
    this.account = new JwtOperator(
      this.configService.envs.JWT_SECRET_KEY,
      ZodCheckAccount,
    )
  }

  jwtHttpRequest<U extends JwtPayload = JwtPayload>(
    req: Request,
    options?: jwt.VerifyOptions,
  ): U {
    const authHeader = req.get('Authorization')?.split(' ')[1]
    if (!authHeader) throw new VaildJwtError('Authorization header is missing')

    return jwt.verify(
      authHeader,
      this.configService.envs.JWT_SECRET_KEY,
      options,
    ) as U
  }
}
