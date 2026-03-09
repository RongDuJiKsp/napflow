import {
  ComponentNodesEnum,
  ZodCheckComponentNodeMeta,
} from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import { GraphRunner, type WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { LoopDataRawSchema } from '@shared/common/workflow/node-data/loop'
import { buildIdCache, buildNeighGraph } from '@/src/utils/algorithm'
import { Logger } from '@nestjs/common'

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const LoopDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  LoopDataRawSchema.shape,
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
    // 更新循环索引
    _nkv['loop.index'] = (_nkv['loop.index'] || -1) + 1
    _nkv['loop.maxIndex'] = this.data.maxCount
    if (_nkv['loop.index'] >= this.data.maxCount) return

    // 获取子图的头节点
    const headNodes = thread.plugin.commNodes.filter(
      node =>
        node.parentId === this.id
        && node.data.type === ComponentNodesEnum.LoopStart,
    )
    if (headNodes.length === 0 || headNodes.length > 1) {
      this.logger.error('loop node has no head node or more than one')
      _nextTask.abort()
      return
    }
    // 获取子图的 GraphRunner
    const subGraphRunner = this.getRunner(thread)
    subGraphRunner.enqueue(headNodes[0])

    const runableNodes: CommNode[] = []
    while (subGraphRunner.hasNext()) {
      const node = subGraphRunner.next()
      if (!node) continue
      runableNodes.push(node)
    }
    // 将子图的节点加入队列
    for (const node of runableNodes) thread.graphRunner.enqueue(node)

    thread.graphRunner.enqueue(this) // loop节点自己也加入队列 通过读取nkv的循环索引来判断是否继续循环
  }

  // 获取子图的 GraphRunner
  getRunner(thread: WorkflowThread): GraphRunner {
    const subNodes = thread.plugin.commNodes.filter(
      node => node.parentId === this.id,
    )
    const subNodeIdSet = new Set(subNodes.map(node => node.id))
    const subEdges = thread.plugin.commEdges.filter(
      edge => subNodeIdSet.has(edge.source) || subNodeIdSet.has(edge.target),
    )
    const subGraph = buildNeighGraph(subNodes, subEdges)
    const subNodeCache = buildIdCache(subNodes)
    const subGraphRunner = new GraphRunner(subGraph, subNodeCache)
    return subGraphRunner
  }
}
