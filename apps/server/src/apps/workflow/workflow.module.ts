import { Module } from '@nestjs/common'
import { WorkflowService } from './workflow.service'
import { WorkflowDataService } from './workflow-data.service'
import { WorkflowRecordController } from './workflow-record.controller'
import { WorkflowFlowController } from './workflow-flow.controller'
import { WorkflowVersionsController } from './workflow-versions.controller'

@Module({
  providers: [WorkflowService, WorkflowDataService],
  exports: [WorkflowService, WorkflowDataService],
  controllers: [
    WorkflowRecordController,
    WorkflowFlowController,
    WorkflowVersionsController,
  ],
})
export class WorkflowModule {}
