import { JwtService } from '@/src/apps/account/jwt.service'
import { AllowUserGroup } from '@/src/decorator/account'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
@Injectable()
export class UserGroupGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector, @Inject(JwtService) private readonly jwtService: JwtService) {}
  canActivate(ctx: ExecutionContext): boolean {
    // 没有打标则放行
    const userGroup = this.reflector.get(AllowUserGroup, ctx.getHandler())
    if(!userGroup)
      return true
    const account = this.jwtService.account.jwtHeader(ctx.switchToHttp().getRequest<Request>().headers)
    return account.userGroup.map(u => u.groupType).includes(userGroup)
  }
}
