import { Reflector } from '@nestjs/core'
import { JwtBody } from './jwt'
import type { UserRole } from '@shared/common/account/base'
import { ZodCheckAccount } from '@shared/common/account/base'

export const AllowUserGroup = Reflector.createDecorator<UserRole>()
export const JwtAccount = () => JwtBody({ zod: ZodCheckAccount })
