import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { raiseErrors } from '../../../utils/errors'
import { ReplyDataRawSchema, ReplyTarget } from '@shared/common/workflow/node-data/reply'

// 从共享模块re-export，方便其他文件引用
export { ReplyTarget }

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const ReplyDataCtxSchema = ZodCheckComponentNodeMeta.extend(ReplyDataRawSchema.shape)

export type ReplyDataCtx = z.infer<typeof ReplyDataCtxSchema>

export class ReplyNode extends CommNode<ReplyDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action
  constructor(data: CommNodeType<ReplyDataCtx>) {
    super(data)
  }

  onThread(thread: WorkflowThread, _nextTask: WillTask, _nkv: Record<string, any>): void | Promise<void> {
    raiseErrors(thread, ReplyNode)
  }
}
