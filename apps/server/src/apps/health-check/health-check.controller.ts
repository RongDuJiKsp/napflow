import { Controller, Get, Inject, Logger } from '@nestjs/common'
import { HealthCheckService } from './health-check.service'
import { AllowUserGroup } from '@/src/decorator/account'
import { UserRole } from '@shared/common/account/base'
import { ZodSerializerDto } from 'nestjs-zod'
import { ZodCheckHealthCheckSamplesResp } from '@shared/data-transfer/health-check/samples'
import { Resp } from '@shared/data-transfer/_base'

@Controller('health')
export class HealthCheckController {
  private readonly logger = new Logger(HealthCheckController.name)

  constructor(
    @Inject(HealthCheckService)
    private readonly healthCheckService: HealthCheckService,
  ) {}

  @Get('samples')
  @AllowUserGroup(UserRole.User)
  @ZodSerializerDto(ZodCheckHealthCheckSamplesResp)
  async getSamples() {
    const samples = this.healthCheckService.getAggregatedMetrics(80)
    return Resp.ok(samples)
  }
}
