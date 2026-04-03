import { Inject, Injectable } from '@nestjs/common'
import jwt from 'jsonwebtoken'
import zod from 'zod'
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
    try{
      return this.zod.parse(jwt.verify(token, this.secret, options))
    }
    catch (err) {
      // 单独捕获 JSON 解析错误，抛出可被拦截到的 VaildJwtError
      if(err instanceof SyntaxError)
        throw new VaildJwtError('Invalid JWT: Payload JSON is malformed')

      throw err
    }
  }

  jwtHttpRequest(req: Request, options?: jwt.VerifyOptions) {
    const authHeader = req.get('Authorization')?.split(' ')[1]
    if (!authHeader) throw new VaildJwtError('Authorization header is missing')

    return this.jwtVerify(authHeader, options)
  }
}

@Injectable()
export class JwtService {
  account: JwtOperator<Account>
  any: JwtOperator<any>

  constructor(
    @Inject(AppConfigService) private readonly configService: AppConfigService,
  ) {
    this.account = new JwtOperator(
      this.configService.envs.JWT_SECRET_KEY,
      ZodCheckAccount,
    )
    this.any = new JwtOperator(
      this.configService.envs.JWT_SECRET_KEY,
      zod.any(),
    )
  }

  jwtHttpRequest<U extends JwtPayload = JwtPayload>(
    req: Request,
    options?: jwt.VerifyOptions,
  ): U {
    return this.any.jwtHttpRequest(req, options)
  }
}
