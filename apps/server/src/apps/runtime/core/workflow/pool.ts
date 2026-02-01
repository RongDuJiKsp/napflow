import { randomUUID } from 'node:crypto'
import type { WillTask } from '@/src/utils/task-pool'
import { Task } from '@/src/utils/task-pool'
import type { CommNodeType, CommTrigger, TriggerOnEvents } from './node'
import { CommEdge, CommNode, CommNodeRole, defineCommNodeSchema } from './node'
import { type Edge, type Node, NodeClassic } from '@shared/common/workflow/core'
import type { NodeKlassMap } from './constant'
import { NodeSchemaMap } from './constant'
import { buildNeighGraph } from '@/src/utils/algorithm'
import { assign } from 'lodash-es'
import { Queue } from 'datastructures-js'
import { Logger } from '@nestjs/common'

export type PluginConfigs = {
  threadMaxLiveSecond?: number // 任务线程最大存活时间 默认10分钟
}
/**
 * @description 任务池 每个任务池对应一个plugin 任务池为抽象类 任务池的启动由适配器管理
 */
export class CommPlugin {
  readonly threads: Record<string, WorkflowThread> = {}
  readonly tasks: Record<string, Task<() => void>> = {}
  // 邻居图
  readonly nodeGraph: ReadonlyMap<CommNode, { prev: CommNode[]; next: CommNode[] }>
  readonly graphHead: CommNode & CommTrigger
  readonly klassMap: typeof NodeKlassMap
  readonly configs: PluginConfigs

  constructor(nodes: Node[], edges: Edge[], klassMap: typeof NodeKlassMap, configs: PluginConfigs = {}) {
    this.configs = configs
    this.klassMap = klassMap
    // 过滤出组件节点
    const commNodes = nodes.filter(node => node.type === NodeClassic.Component).map(node => node as CommNodeType).map(commNode => CommNode.parse(defineCommNodeSchema(NodeSchemaMap[commNode.data.type]), commNode, klassMap[commNode.data.type]))
    // 过滤出组件边
    const commIds = new Set(commNodes.map(node => node.id))
    const CommEdges = edges.filter(edge => commIds.has(edge.source) && commIds.has(edge.target)).map(edge => new CommEdge(edge))
    // 构建邻居图
    this.nodeGraph = buildNeighGraph<CommNode, CommEdge>(commNodes, CommEdges)
    // 获取图头
    const triggers = commNodes.filter(node => node.role === CommNodeRole.Trigger) as (CommNode & CommTrigger)[]
    if(triggers.length === 0 || triggers.length > 1)
      throw new Error('Workflow must have exactly one trigger node')
    this.graphHead = triggers[0]
  }

  get threadList() {
    return Object.values(this.threads)
  }

  // 这里凡是被message触发就提交任务 该不该往下走交给Thread自己判断
  onTrigger(endPoint: TriggerOnEvents, kv?: Record<string, any>) {
    const thread = new WorkflowThread(endPoint, this)
    this.threads[thread.id] = thread
    assign(thread.kv, kv)
    const taskTick = async () => {
      delete this.tasks[thread.id]
      const nextTask = Task.will(taskTick)
      await thread.tick(nextTask)
      nextTask.orSubmit(task => this.tasks[thread.id] = task)
    }
    this.tasks[thread.id] = Task.submit(taskTick)
  }
}

/**
 * @description 任务线程 每个实例对应每次触发创建的运行实体
 */
export class WorkflowThread {
  // 上下文数据
  readonly id = randomUUID()
  readonly createdAt = new Date()
  readonly kv: Record<string, any> = {}
  readonly nodeKv: Record<string, Record<string, any>> = {}

  readonly triggerEndpoint: TriggerOnEvents
  readonly plugin: CommPlugin

  // 运行时图数据
  readonly availableNodes = new Queue<CommNode>()
  readonly mayBeNextNodeDegree: Map<CommNode, number> = new Map()

  readonly logger = new Logger(`${WorkflowThread.name}#${this.id}`)

  constructor(triggerEndpoint: TriggerOnEvents, plugin: CommPlugin) {
    this.triggerEndpoint = triggerEndpoint
    this.plugin = plugin

    this.logger.debug(`thread created by${triggerEndpoint}`)
    // 将endpoints初始化到节点
    this.applyEndPoints()
  }

  applyEndPoints() {
    const startNode = this.plugin.graphHead
    if(startNode.triggerEv === this.triggerEndpoint)
      this.availableNodes.enqueue(startNode)
  }

  async tick(nextTask: WillTask) {
    if(this.shouldBeKill()) {
      this.logger.debug('thread killed')
      nextTask.abort()
      this.unmount()
      return
    }
    const currNode = this.availableNodes.dequeue()
    if(!currNode) {
      nextTask.abort()
      this.logger.debug('no more node to run,exiting')
      this.unmount()
      return
    }

    this.nodeKv[currNode.id] = {}
    currNode.onThread(this, nextTask, this.nodeKv[currNode.id])

    for(const nextNode of this.plugin.nodeGraph.get(currNode)?.next ?? []) {
      if(!this.mayBeNextNodeDegree.has(nextNode))
        this.mayBeNextNodeDegree.set(nextNode, this.plugin.nodeGraph.get(nextNode)!.prev.length)

      if(this.mayBeNextNodeDegree.has(nextNode)) {
        const degree = this.mayBeNextNodeDegree.get(nextNode)!
        if(degree > 1) {
          this.mayBeNextNodeDegree.set(nextNode, degree - 1)
        }
        else if(degree === 1) {
          this.availableNodes.enqueue(nextNode)
          this.mayBeNextNodeDegree.delete(nextNode)
        }
        else{
          throw new Error('degree must be greater than 0')
        }
      }
    }
  }

  shouldBeKill() {
    let killReason = ''
    const { threadMaxLiveSecond = 600 } = this.plugin.configs

    // 线程存活时间超时
    const isThreadLiveTimeout = Date.now() - this.createdAt.getTime() > threadMaxLiveSecond * 1000
    if(isThreadLiveTimeout)
      killReason = `thread live timeout : ${Date.now() - this.createdAt.getTime()}s`

    // 打印log 结算
    if(killReason)
      this.logger.log(killReason)

    return killReason
  }

  unmount() {
    delete this.plugin.threads[this.id]
  }
}
