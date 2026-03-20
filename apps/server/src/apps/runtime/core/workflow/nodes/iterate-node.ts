import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/core/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { GraphRunner } from '../pool'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { IterateDataSchema } from '@shared/common/workflow/node-data/iterate'
import { Logger } from '@nestjs/common'

export const IterateDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  IterateDataSchema.shape,
)

export type IterateDataCtx = z.infer<typeof IterateDataCtxSchema>

export class IterateNode extends CommNode<IterateDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action
  private readonly logger = new Logger(IterateNode.name)

  constructor(data: CommNodeType<IterateDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    const sourceArr = this.getIteratorTarget(thread)
    if (!Array.isArray(sourceArr)) {
      this.logger.warn('iterate source is not an array, skipping')
      return
    }

    // 注意这里的 ?? 一定不能被 || 代替
    _nkv['iter.index'] = (_nkv['iter.index'] ?? -1) + 1
    _nkv['iter.maxIndex'] = sourceArr.length - 1
    if (_nkv['iter.index'] >= sourceArr.length) return
    _nkv['iter.item'] = sourceArr[_nkv['iter.index']]

    const headNode = thread.plugin.graphManager.getSubGraphHead(
      this.id,
      ComponentNodesEnum.IterateStart,
    )
    if (!headNode) {
      this.logger.error('iterate node has no head node or more than one')
      _nextTask.abort()
      return
    }

    const subGraphRunner = this.getRunner(thread)
    subGraphRunner.enqueue(headNode)

    // iterate节点自己也加入队列 通过读取nkv的迭代索引来判断是否继续迭代 顺序为先所有子节点再自己
    thread.graphRunner.enqueueNextMany([...subGraphRunner.consumeAll(), this])
  }

  private getIteratorTarget(thread: WorkflowThread): unknown {
    const [sourceNodeId, ...namespaces] = this.data.sourceVarName.split('.')
    if (!sourceNodeId || namespaces.length === 0) return []
    return thread.nodeKv[sourceNodeId]?.[namespaces.join('.')]
  }

  getRunner(thread: WorkflowThread): GraphRunner {
    return thread.getSubGraphRunner(this.id)
  }
}
