import {
  ZodCheckComponentNodeMeta,
} from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { raiseErrors } from '../../../utils/errors'
import { LoopStartDataRawSchema } from '@shared/common/workflow/node-data/loop-start'

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const LoopStartDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  LoopStartDataRawSchema.shape,
)

export type LoopStartDataCtx = z.infer<typeof LoopStartDataCtxSchema>

export class LoopStartNode extends CommNode<LoopStartDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action

  constructor(data: CommNodeType<LoopStartDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    raiseErrors(thread, LoopStartNode)
  }
}
