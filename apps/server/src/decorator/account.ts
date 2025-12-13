import { Reflector } from '@nestjs/core'
import type { UserGroupTypes } from '../prisma/generated/enums'
import { JwtBody } from './jwt'
import { Account } from '@shared/data-transfer/account/base'

export const AllowUserGroup = Reflector.createDecorator<UserGroupTypes>()
export const JwtAccount = () => JwtBody({ zod: Account })
