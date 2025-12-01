import { AllowUserGroup } from '@/src/decorator/account'
import { jwtHeaderAccount } from '@/src/utils/account'
import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
@Injectable()
export class UserGroupGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const account = jwtHeaderAccount(ctx.switchToHttp().getRequest<Request>().headers)
    const userGroup = this.reflector.get(AllowUserGroup, ctx.getHandler())
    return account.userGroup.includes(userGroup)
  }
}
