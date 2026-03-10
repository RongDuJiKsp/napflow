import {
  ComponentNodesEnum,
  ZodCheckComponentNodeMeta,
} from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import { GraphRunner, type WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { IterateDataRawSchema } from '@shared/common/workflow/node-data/iterate'
import { buildIdCache, buildNeighGraph } from '@/src/utils/algorithm'
import { Logger } from '@nestjs/common'

export const IterateDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  IterateDataRawSchema.shape,
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

    _nkv['iter.index'] = (_nkv['iter.index'] || -1) + 1
    _nkv['iter.maxIndex'] = sourceArr.length - 1
    if (_nkv['iter.index'] >= sourceArr.length) return
    _nkv['iter.item'] = sourceArr[_nkv['iter.index']]

    const headNodes = thread.plugin.commNodes.filter(
      node =>
        node.parentId === this.id
        && node.data.type === ComponentNodesEnum.IterateStart,
    )
    if (headNodes.length === 0 || headNodes.length > 1) {
      this.logger.error('iterate node has no head node or more than one')
      _nextTask.abort()
      return
    }

    const subGraphRunner = this.getRunner(thread)
    subGraphRunner.enqueue(headNodes[0])

    const runableNodes: CommNode[] = []
    while (subGraphRunner.hasNext()) {
      const node = subGraphRunner.next()
      if (!node) continue
      runableNodes.push(node)
    }
    for (const node of runableNodes) thread.graphRunner.enqueue(node)

    thread.graphRunner.enqueue(this)
  }

  private getIteratorTarget(thread: WorkflowThread): unknown {
    const [sourceNodeId, ...namespaces] = this.data.sourceVarName.split('.')
    if (!sourceNodeId || namespaces.length === 0) return []
    return thread.nodeKv[sourceNodeId]?.[namespaces.join('.')]
  }

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
