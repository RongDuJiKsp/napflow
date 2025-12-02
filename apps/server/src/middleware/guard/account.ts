import type { JwtService } from '@/src/apps/account/jwt.service'
import { AllowUserGroup } from '@/src/decorator/account'
import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
@Injectable()
export class UserGroupGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwtService: JwtService) {}
  canActivate(ctx: ExecutionContext): boolean {
    const account = this.jwtService.account.jwtHeader(ctx.switchToHttp().getRequest<Request>().headers)
    const userGroup = this.reflector.get(AllowUserGroup, ctx.getHandler())
    return account.userGroup.map(u => u.groupType).includes(userGroup)
  }
}
