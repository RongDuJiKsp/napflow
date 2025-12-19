import { JwtService } from '@/src/apps/account/jwt.service'
import { AllowUserGroup } from '@/src/decorator/account'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
@Injectable()
export class UserGroupGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector, @Inject(JwtService) private readonly jwtService: JwtService) {}
  private readonly logger = new Logger(UserGroupGuard.name)

  canActivate(ctx: ExecutionContext): boolean {
    // 没有打标则放行
    const userGroup = this.reflector.get(AllowUserGroup, ctx.getHandler())
    if(!userGroup)
      return true
    const request = ctx.switchToHttp().getRequest<Request>()
    const account = this.jwtService.account.jwtHttpRequest(request)
    this.logger.log(`用户${account.nickname}(${account.userGroup.map(u => u.groupType).join(',')}) 访问${request.path}(${userGroup})`)
    return account.userGroup.map(u => u.groupType).includes(userGroup)
  }
}
