import {
  ComponentNodesEnum,
} from '@shared/common/workflow/core/component-node'
import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/core/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { GraphRunner } from '../pool'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { LoopDataSchema } from '@shared/common/workflow/node-data/loop'
import { Logger } from '@nestjs/common'

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const LoopDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  LoopDataSchema.shape,
)

export type LoopDataCtx = z.infer<typeof LoopDataCtxSchema>

export class LoopNode extends CommNode<LoopDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action
  private readonly logger = new Logger(LoopNode.name)

  constructor(data: CommNodeType<LoopDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    // 更新循环索引  注意这里的 ?? 一定不能被 || 代替
    _nkv['loop.index'] = (_nkv['loop.index'] ?? -1) + 1
    _nkv['loop.maxIndex'] = this.data.maxCount
    if (_nkv['loop.index'] >= this.data.maxCount) return

    // 获取子图的头节点
    const headNode = thread.plugin.graphManager.getSubGraphHead(
      this.id,
      ComponentNodesEnum.LoopStart,
    )
    if (!headNode) {
      this.logger.error('loop node has no head node or more than one')
      _nextTask.abort()
      return
    }
    // 获取子图的 GraphRunner
    const subGraphRunner = this.getRunner(thread)
    subGraphRunner.enqueue(headNode)

    // loop 节点自己也加入队列 通过读取nkv的迭代索引来判断是否继续迭代 顺序为先所有子节点再自己
    thread.graphRunner.enqueueNextMany([...subGraphRunner.consumeAll(), this])
  }

  // 获取子图的 GraphRunner
  getRunner(thread: WorkflowThread): GraphRunner {
    return thread.getSubGraphRunner(this.id)
  }
}
