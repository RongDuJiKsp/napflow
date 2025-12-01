import { Reflector } from '@nestjs/core'
import type { UserGroupTypes } from '../prisma/generated/enums'

export const AllowUserGroup = Reflector.createDecorator<UserGroupTypes>()
