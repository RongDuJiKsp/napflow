import { ZodCheckComponentNodeDataTag } from '@shared/common/workflow/core/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { IterateStartDataSchema } from '@shared/common/workflow/node-data/iterate-start'
import { Logger } from '@nestjs/common'
import { merge } from 'lodash-es'

export const IterateStartDataCtxSchema = ZodCheckComponentNodeDataTag.extend(
  IterateStartDataSchema.shape,
)

export type IterateStartDataCtx = z.infer<typeof IterateStartDataCtxSchema>

export class IterateStartNode extends CommNode<IterateStartDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action
  private readonly logger = new Logger(IterateStartNode.name)

  constructor(data: CommNodeType<IterateStartDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    if (!this.parentId) {
      this.logger.error('iterate start node must have parent')
      _nextTask.abort()
      return
    }

    merge(_nkv, {
      'iter.index': thread.nodeKv[this.parentId]['iter.index'],
      'iter.maxIndex': thread.nodeKv[this.parentId]['iter.maxIndex'],
      'iter.item': thread.nodeKv[this.parentId]['iter.item'],
    })
  }
}
