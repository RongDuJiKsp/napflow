import { JWT_SECRET_KEY } from '@/src/config/secret'
import jwt from 'jsonwebtoken'
import type z from 'zod'

export type JwtPayload = object | string | Buffer<ArrayBufferLike>
// zod类型安全的jwt
export const defineJwtBody = <T extends JwtPayload>(zod: z.ZodType<T>) => {
  const jwtSign = (payload: T, options?: jwt.SignOptions) => {
    return jwt.sign(zod.parse(payload), JWT_SECRET_KEY, options)
  }
  const jwtVerify = (token: string, options?: jwt.VerifyOptions) => {
    return zod.parse(jwt.verify(token, JWT_SECRET_KEY, options))
  }
  return {
    jwtSign,
    jwtVerify,
  }
}
export class VaildJwtError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VaildJwtError'
  }
}
export const jwtHeader = <T extends JwtPayload>(header: Headers, options?: jwt.VerifyOptions) => {
  const authHeader = header.get('Authorization')?.split(' ')[1]
  if(!authHeader)
    throw new VaildJwtError('Authorization header is missing')

  return jwt.verify(authHeader, JWT_SECRET_KEY, options) as T
}
export const defineJwtHeader = <T extends JwtPayload>(zod: z.ZodType<T>) => {
  const jwtHeaderC = (header: Headers, options?: jwt.VerifyOptions) => {
    return zod.parse(jwtHeader(header, options))
  }
  return {
    jwtHeaderC,
  }
}
