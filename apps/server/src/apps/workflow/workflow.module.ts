import { Module } from '@nestjs/common'
import { WorkflowService } from './workflow.service'
import { WorkflowController } from './workflow.controller'

@Module({
  providers: [WorkflowService],
  exports: [WorkflowService],
  controllers: [WorkflowController],
})
export class WorkflowModule {}
