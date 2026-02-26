import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { LoopStartDataRawSchema } from '@shared/common/workflow/node-data/loop-start'
import { Logger } from '@nestjs/common'
import { merge } from 'lodash-es'

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const LoopStartDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  LoopStartDataRawSchema.shape,
)

export type LoopStartDataCtx = z.infer<typeof LoopStartDataCtxSchema>

export class LoopStartNode extends CommNode<LoopStartDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action
  private readonly logger = new Logger(LoopStartNode.name)

  constructor(data: CommNodeType<LoopStartDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    // 判断一下有没有父节点
    if(!this.parentId) {
      this.logger.error('loop start node must have parent')
      _nextTask.abort()
      return
    }
    // 由于输出变量是写在LoopStart节点上的 因此每次执行都从Loop节点拷贝一次
    merge(_nkv, {
      'loop.index': thread.nodeKv[this.parentId]['loop.index'],
      'loop.maxIndex': thread.nodeKv[this.parentId]['loop.maxIndex'],
    })
  }
}
