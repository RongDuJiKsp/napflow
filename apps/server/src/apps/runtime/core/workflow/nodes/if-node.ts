import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { raiseErrors } from '../../../utils/errors'
import { IfDataRawSchema } from '@shared/common/workflow/node-data/if'

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const IfDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  IfDataRawSchema.shape,
)

export type IfDataCtx = z.infer<typeof IfDataCtxSchema>

export class IfNode extends CommNode<IfDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action

  constructor(data: CommNodeType<IfDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    // TODO: 实现条件分支的运行时逻辑
    raiseErrors(thread, IfNode)
  }
}
