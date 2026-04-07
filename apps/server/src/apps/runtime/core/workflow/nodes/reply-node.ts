import { ZodCheckComponentNodeDataTag } from '@shared/common/workflow/core/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { raiseErrors } from '@runtime/utils/errors'
import { ReplyDataSchema } from '@shared/common/workflow/node-data/reply'

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const ReplyDataCtxSchema = ZodCheckComponentNodeDataTag.extend(
  ReplyDataSchema.shape,
)

export type ReplyDataCtx = z.infer<typeof ReplyDataCtxSchema>

export class ReplyNode extends CommNode<ReplyDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action
  constructor(data: CommNodeType<ReplyDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    raiseErrors(thread, ReplyNode)
  }
}
