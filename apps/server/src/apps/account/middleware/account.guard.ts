import { JwtService } from '@/src/apps/account/jwt.service'
import { AllowUserGroup } from '@/src/decorator/account'
import { ExpressExecContext } from '@/src/utils/nest-middleware'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
@Injectable()
export class UserGroupGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(UserGroupGuard.name)

  canActivate(execCtx: ExecutionContext): boolean {
    const ctx = new ExpressExecContext(execCtx)
    // 没有打标则放行
    const userGroup = this.reflector.get(AllowUserGroup, ctx.c.getHandler())
    if (!userGroup) return true
    const account = this.jwtService.account.jwtHttpRequest(ctx.request)
    this.logger.log(
      `用户${account.nickname}(${account.userGroup.map(u => u.groupType).join(',')}) 访问${ctx.request.path}(${userGroup})`,
    )
    return account.userGroup.map(u => u.groupType).includes(userGroup)
  }
}
