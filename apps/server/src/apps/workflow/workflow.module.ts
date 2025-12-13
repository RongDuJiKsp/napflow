import { Module } from '@nestjs/common'
import { WorkflowService } from './workflow.service'
import { WorkflowController } from './workflow.controller'
import { WorkflowDataService } from './workflow-data.service'

@Module({
  providers: [WorkflowService, WorkflowDataService],
  exports: [WorkflowService, WorkflowDataService],
  controllers: [WorkflowController],
})
export class WorkflowModule {}
