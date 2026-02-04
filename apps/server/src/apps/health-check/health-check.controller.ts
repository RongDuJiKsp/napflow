import { Controller, Inject, Logger } from '@nestjs/common'
import { HealthCheckService } from './health-check.service'

@Controller('health')
export class HealthCheckController {
  private readonly logger = new Logger(HealthCheckController.name)

  constructor(@Inject(HealthCheckService) private readonly healthCheckService: HealthCheckService) {}
}
