import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { raiseErrors } from '../../../utils/errors'
import { LoopDataRawSchema } from '@shared/common/workflow/node-data/loop'

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const LoopDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  LoopDataRawSchema.shape,
)

export type LoopDataCtx = z.infer<typeof LoopDataCtxSchema>

export class LoopNode extends CommNode<LoopDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action

  constructor(data: CommNodeType<LoopDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    raiseErrors(thread, LoopNode)
  }
}
