import { randomUUID } from 'node:crypto'
import type { WillTask } from '@/src/utils/task-pool'
import { Task } from '@/src/utils/task-pool'
import type { CommNodeType, CommTrigger, TriggerOnEvents } from './node'
import { CommEdge, CommNode, CommNodeRole, defineCommNodeSchema } from './node'
import {
  type Edge,
  type Node,
  NodeClassic,
} from '@shared/common/workflow/core'
import type { NodeKlassMap } from './constant'
import { NodeSchemaMap } from './constant'
import {
  buildIdCache,
  buildNeighGraph,
  getConnectedNodes,
} from '@/src/utils/algorithm'
import { merge } from 'lodash-es'
import JoinableQueue from '@shared/data-struct/JoinableQueue'
import { Logger } from '@nestjs/common'
import type {
  ComponentNodesEnum,
  Var,
} from '@shared/common/workflow/component-node'
import type { BotWorkflowAppBindingConfig } from '@shared/common/bot/adapter'
import type { Class } from 'type-fest'
import type { PluginService } from '@/src/utils/traits'

export type PluginConfigs = {
  threadMaxLiveSecond?: number; // 任务线程最大存活时间 默认10分钟
}

export class CommPluginGraphManager {
  readonly nodeGraph: ReadonlyMap<
    CommNode,
    { prev: CommNode[]; next: CommNode[] }
  >

  readonly commNodes: CommNode[]
  readonly commNodeCache: Record<string, CommNode>
  readonly commEdges: CommEdge[]
  readonly commEdgeCache: Record<string, CommEdge>
  readonly graphHead: CommNode & CommTrigger
  readonly graphHeadConnectedNodes: Set<CommNode>

  constructor(
    readonly nodes: Node[],
    readonly edges: Edge[],
    readonly klassMap: typeof NodeKlassMap,
  ) {
    // 过滤出组件节点
    const commNodes = nodes
      .filter(node => node.type === NodeClassic.Component)
      .map(node => node as CommNodeType)
      .map(commNode =>
        CommNode.parse(
          defineCommNodeSchema(NodeSchemaMap[commNode.data.type]),
          commNode,
          klassMap[commNode.data.type],
        ),
      )

    // 过滤出组件边
    const commIds = new Set(commNodes.map(node => node.id))
    const commEdges = edges
      .filter(edge => commIds.has(edge.source) && commIds.has(edge.target))
      .map(edge => new CommEdge(edge))

    // 构建邻居图
    this.nodeGraph = buildNeighGraph<CommNode, CommEdge>(commNodes, commEdges)

    // 获取图头
    const triggers = commNodes.filter(
      node => node.role === CommNodeRole.Trigger,
    ) as (CommNode & CommTrigger)[]
    if (triggers.length === 0 || triggers.length > 1)
      throw new Error('Workflow must have exactly one trigger node')

    this.graphHead = triggers[0]
    this.commNodes = commNodes
    this.commNodeCache = buildIdCache(commNodes)
    this.commEdges = commEdges
    this.commEdgeCache = buildIdCache(commEdges)
    this.graphHeadConnectedNodes = getConnectedNodes(
      this.nodeGraph,
      this.graphHead.id,
    )
  }

  getSubGraphHead(parentId: string, subHeadType: ComponentNodesEnum) {
    const headNodes = this.commNodes.filter(
      node => node.parentId === parentId && node.data.type === subHeadType,
    )
    if (headNodes.length === 0 || headNodes.length > 1) return null

    return headNodes[0]
  }

  getSubGraph(parentNodeId: string) {
    const subNodes = this.commNodes.filter(
      node => node.parentId === parentNodeId,
    )
    const subNodeIdSet = new Set(subNodes.map(node => node.id))
    const subEdges = this.commEdges.filter(
      edge => subNodeIdSet.has(edge.source) || subNodeIdSet.has(edge.target),
    )
    return buildNeighGraph(subNodes, subEdges)
  }

  getSubGraphRunner(parentNodeId: string) {
    const subNodes = this.commNodes.filter(
      node => node.parentId === parentNodeId,
    )
    const subGraph = this.getSubGraph(parentNodeId)
    const subNodeCache = buildIdCache(subNodes)
    const subGraphRunner = new GraphRunner(subGraph, null, subNodeCache)
    return subGraphRunner
  }
}

export class CommPluginTaskManager<SDK = unknown> {
  readonly threads: Record<string, WorkflowThread<SDK>> = {}
  readonly tasks: Record<string, Task<() => void>> = {}

  constructor(private readonly plugin: CommPlugin<SDK>) {}

  // 这里凡是被message触发就提交任务 该不该往下走交给Thread自己判断
  onTrigger(endPoint: TriggerOnEvents, kv?: Record<string, string>) {
    const thread = new WorkflowThread(endPoint, this.plugin)
    this.threads[thread.id] = thread
    merge(thread.kv, kv)
    merge(thread.nodeKv, {
      global: this.plugin.bindingConfig.envKV || {},
    })

    const taskTick = async () => {
      delete this.tasks[thread.id]
      const nextTask = Task.will(taskTick)
      await thread.tick(nextTask)
      nextTask.orSubmit(task => (this.tasks[thread.id] = task))
    }

    this.tasks[thread.id] = Task.submit(taskTick)
  }

  removeThread(threadId: string) {
    delete this.threads[threadId]
    if (this.tasks[threadId]) {
      this.tasks[threadId].abort()
      delete this.tasks[threadId]
    }
  }
}

/**
 * @description 图运行器 托管节点执行队列和入度管理，负责获取下一个需要执行的节点
 */
export class GraphRunner {
  private readonly availableNodes = new JoinableQueue<CommNode>()
  private readonly mayBeNextNodeDegree: Map<CommNode, number> = new Map()

  constructor(
    private readonly nodeGraph: ReadonlyMap<
      CommNode,
      { prev: CommNode[]; next: CommNode[] }
    >,
    // 如果传入了 mainGraphNodes 则只对这些节点进行入度管理，否则对所有节点进行入度管理
    private readonly mainGraphNodes: Set<CommNode> | null,
    private readonly commNodeCache: Record<string, CommNode>,
  ) {}

  enqueue(node: CommNode) {
    this.availableNodes.enqueue(node)
  }

  enqueueNext(node: CommNode) {
    this.availableNodes.enqueueNext(node)
  }

  enqueueNextMany(nodes: CommNode[]) {
    this.availableNodes.enqueueNextMany(nodes)
  }

  /** 当前待执行队列的节点数量 */
  size(): number {
    return this.availableNodes.size()
  }

  /** 是否还有待执行的节点 */
  hasNext(): boolean {
    return this.availableNodes.size() > 0
  }

  /** 获取下一个需要执行的节点，同时准备好后续节点的入度计算，无节点时返回 null */
  next(): CommNode | null {
    const currNode = this.availableNodes.dequeue()
    if (!currNode) return null
    if (!this.mainGraphNodes || this.mainGraphNodes.has(currNode))
      this.readyExecNext(currNode)

    return currNode
  }

  /** 从队列中移除指定节点 */
  removeQueue(toRemoveNodeId: string[]) {
    const toRemoveSet = new Set(toRemoveNodeId)
    for (const target of toRemoveNodeId)
      this.mayBeNextNodeDegree.delete(this.commNodeCache[target])
    const toRepushArr = this.availableNodes
      .toArray()
      .filter(item => !toRemoveSet.has(item.id))
    this.availableNodes.clear()
    this.availableNodes.enqueueNextMany(toRepushArr)
  }

  /** 根据当前节点的后继，更新入度并将就绪节点加入队列 */
  private readyExecNext(currNode: CommNode) {
    for (const nextNode of this.nodeGraph.get(currNode)?.next ?? []) {
      if (!this.mayBeNextNodeDegree.has(nextNode)) {
        this.mayBeNextNodeDegree.set(
          nextNode,
          this.nodeGraph.get(nextNode)!.prev.length,
        )
      }

      if (this.mayBeNextNodeDegree.has(nextNode)) {
        const degree = this.mayBeNextNodeDegree.get(nextNode)!
        if (degree > 1) {
          this.mayBeNextNodeDegree.set(nextNode, degree - 1)
        }
        else if (degree === 1) {
          this.availableNodes.enqueue(nextNode)
          this.mayBeNextNodeDegree.delete(nextNode)
        }
        else {
          throw new Error('degree must be greater than 0')
        }
      }
    }
  }

  consumeAll() {
    const runableNodes: CommNode[] = []
    while (this.hasNext()) {
      const node = this.next()
      if (!node) continue
      runableNodes.push(node)
    }
    return runableNodes
  }
}

/**
 * @description 任务池 每个任务池对应一个plugin 任务池为抽象类 任务池的启动由适配器管理
 */
export class CommPlugin<SDK = unknown> implements PluginService<[SDK]> {
  // deps
  readonly graphManager: CommPluginGraphManager
  readonly taskManager: CommPluginTaskManager<SDK>

  // dep cfg
  readonly configs: PluginConfigs

  // mount infos
  sdk: SDK | null = null

  constructor(
    readonly nodes: Node[],
    readonly edges: Edge[],
    readonly env: Var[],
    readonly bindingConfig: BotWorkflowAppBindingConfig,
    readonly klassMap: typeof NodeKlassMap,
    configs: PluginConfigs = {},
  ) {
    this.configs = configs
    this.graphManager = new CommPluginGraphManager(nodes, edges, klassMap)
    this.taskManager = new CommPluginTaskManager(this)
  }

  get threadList() {
    return Object.values(this.taskManager.threads)
  }

  onTrigger(endPoint: TriggerOnEvents, kv?: Record<string, string>) {
    this.taskManager.onTrigger(endPoint, kv)
  }

  mount(sdk: SDK) {
    this.sdk = sdk
  }

  unmount() {
    this.sdk = null
  }
}

/**
 * @description 任务线程 每个实例对应每次触发创建的运行实体
 */
export class WorkflowThread<SDK = unknown> {
  // 上下文数据
  readonly id = randomUUID()
  readonly createdAt = new Date()
  readonly kv: Record<string, string> = {}
  readonly nodeKv: Record<string, Record<string, any>> = {}

  readonly triggerEndpoint: TriggerOnEvents
  readonly plugin: CommPlugin<SDK>

  // 运行时图数据
  readonly graphRunner: GraphRunner

  readonly logger = new Logger(`${WorkflowThread.name}#${this.id}`)

  constructor(triggerEndpoint: TriggerOnEvents, plugin: CommPlugin<SDK>) {
    this.triggerEndpoint = triggerEndpoint
    this.plugin = plugin
    this.graphRunner = new GraphRunner(
      plugin.graphManager.nodeGraph,
      plugin.graphManager.graphHeadConnectedNodes,
      plugin.graphManager.commNodeCache,
    )

    this.logger.debug(`thread created by${triggerEndpoint}`)
    // 将endpoints初始化到节点
    this.applyEndPoints()
  }

  private applyEndPoints() {
    const startNode = this.plugin.graphManager.graphHead
    if (startNode.triggerEv === this.triggerEndpoint)
      this.graphRunner.enqueue(startNode)
  }

  private async execNode(currNode: CommNode, nextTask: WillTask) {
    this.nodeKv[currNode.id] = this.nodeKv[currNode.id] || {}
    await currNode.onThread(this, nextTask, this.nodeKv[currNode.id])
  }

  async tick(nextTask: WillTask) {
    if (this.shouldBeKill()) {
      this.logger.debug('thread killed')
      nextTask.abort()
      this.unmount()
      return
    }
    const currNode = this.graphRunner.next()
    if (!currNode) {
      nextTask.abort()
      this.logger.debug('no more node to run,exiting')
      this.unmount()
      return
    }

    await this.execNode(currNode, nextTask)
  }

  private shouldBeKill() {
    let killReason = ''
    const { threadMaxLiveSecond = 600 } = this.plugin.configs

    // 线程存活时间超时
    const isThreadLiveTimeout
      = Date.now() - this.createdAt.getTime() > threadMaxLiveSecond * 1000
    if (isThreadLiveTimeout)
      killReason = `thread live timeout : ${Date.now() - this.createdAt.getTime()}s`

    // 打印log 结算
    if (killReason) this.logger.log(killReason)

    return killReason
  }

  private unmount() {
    this.plugin.taskManager.removeThread(this.id)
  }

  getLogger(klass: Class<CommNode>): Logger {
    return new Logger(`${WorkflowThread.name}::${klass.name}`)
  }

  getSubGraphRunner(parentNodeId: string) {
    return this.plugin.graphManager.getSubGraphRunner(parentNodeId)
  }
}
