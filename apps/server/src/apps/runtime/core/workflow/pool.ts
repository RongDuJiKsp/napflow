import { randomUUID } from 'node:crypto'
import type { TriggerEndpoint } from './nodes/trigger-node'
import type { WillTask } from '@/src/utils/task-pool'
import { Task } from '@/src/utils/task-pool'
import type { CommNodeType } from './node'
import { CommEdge, CommNode, CommNodeRole, defineCommNodeSchema } from './node'
import { type Edge, type Node, NodeClassic } from '@shared/common/workflow/core'
import type { NodeKlassMap, NodeSchemaMap } from './constant'
import { buildNeighGraph } from '@/src/utils/algorithm'

/**
 * @description 任务池 每个任务池对应一个plugin 任务池为抽象类 任务池的启动由适配器管理
 */
export abstract class CommPlugin {
  readonly threads: Record<string, WorkflowThread> = {}
  readonly tasks: Record<string, Task<() => void>> = {}
  // 邻居图
  readonly nodeGraph: ReadonlyMap<CommNode, { prev: CommNode[]; next: CommNode[] }>
  readonly graphHead: CommNode

  constructor(nodes: Node[], edges: Edge[], schemaMap: typeof NodeSchemaMap, klassMap: typeof NodeKlassMap) {
    // 过滤出组件节点
    const commNodes = nodes.filter(node => node.classic === NodeClassic.Component).map(node => node as CommNodeType).map(commNode => CommNode.parse(defineCommNodeSchema(schemaMap[commNode.data.type]), commNode, klassMap[commNode.data.type]))
    // 过滤出组件边
    const commIds = new Set(commNodes.map(node => node.id))
    const CommEdges = edges.filter(edge => commIds.has(edge.source) && commIds.has(edge.target)).map(edge => new CommEdge(edge))
    // 构建邻居图
    this.nodeGraph = buildNeighGraph<CommNode, CommEdge>(commNodes, CommEdges)
    // 获取图头
    const triggers = commNodes.filter(node => node.role === CommNodeRole.Trigger)
    if(triggers.length === 0 || triggers.length > 1)
      throw new Error('Workflow must have exactly one trigger node')
    this.graphHead = triggers[0]
  }

  get threadList() {
    return Object.values(this.threads)
  }

  onTrigger(endPoint: TriggerEndpoint, nid: string) {
    const thread = new WorkflowThread(endPoint, nid, this)
    this.threads[thread.id] = thread
    const taskTick = () => {
      const nextTask = Task.will(taskTick)
      thread.tick(nextTask)
      nextTask.orSubmit(task => this.tasks[thread.id] = task)
    }
    this.tasks[thread.id] = Task.submit(taskTick)
  }
}

/**
 * @description 任务线程 每个实例对应每次触发创建的运行实体
 */
export class WorkflowThread {
  readonly id = randomUUID()
  readonly createdAt = new Date()
  readonly kv: Record<string, any> = {}

  readonly triggerEndpoint: TriggerEndpoint
  readonly nid: string
  readonly plugin: CommPlugin

  constructor(triggerEndpoint: TriggerEndpoint, nid: string, plugin: CommPlugin) {
    this.triggerEndpoint = triggerEndpoint
    this.nid = nid
    this.plugin = plugin
  }

  tick(nextTask: WillTask) {
    console.log('tick')
  }
}
