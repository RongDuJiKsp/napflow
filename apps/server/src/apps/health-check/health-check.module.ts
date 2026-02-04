import { Module } from '@nestjs/common'
import { HealthCheckController } from './health-check.controller'
import { HealthCheckService } from './health-check.service'
import { CheckMemService } from './check-mem.service'
import { CheckCpuService } from './check-cpu.service'
import { CheckEventLoopService } from './check-event-loop.service'
import { CheckGcService } from './check-gc.service'

@Module({
  controllers: [HealthCheckController],
  providers: [
    HealthCheckService,
    CheckMemService,
    CheckCpuService,
    CheckEventLoopService,
    CheckGcService,
  ],
  exports: [
    HealthCheckService,
    CheckMemService,
    CheckCpuService,
    CheckEventLoopService,
    CheckGcService,
  ],
})
export class HealthCheckModule {}
