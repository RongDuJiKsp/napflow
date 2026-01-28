import { randomUUID } from 'node:crypto'
import type { TriggerEndpoint } from './nodes/trigger-node'
import { Task } from '@/src/utils/task-pool'
import type { CommNode } from './node'
import { NodeClassic, type Edge, type Node } from '@shared/common/workflow/core'

/**
 * @description 任务池 每个任务池对应一个plugin 任务池为抽象类 任务池的启动由适配器管理
 */
export abstract class CommPlugin {
  readonly threads: Record<string, WorkflowThread> = {}
  readonly tasks: Record<string, Task<() => void>> = {}
  // 邻居图
  readonly nodeGraph: ReadonlyMap<CommNode, { prev: CommNode[]; next: CommNode[] }>

  constructor(nodes: Node[], edges: Edge[]) {
    const startNode= nodes.find(node => node.type === NodeClassic.Trigger)
    if (!startNode) throw new Error('没有触发节点')

  }

  get threadList() {
    return Object.values(this.threads)
  }

  onTrigger(endPoint: TriggerEndpoint, nid: string) {
    const thread = new WorkflowThread(endPoint, nid)
    this.threads[thread.id] = thread
    const taskTick = () => {
      thread.tick()
      this.tasks[thread.id] = Task.submit(taskTick)
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

  constructor(triggerEndpoint: TriggerEndpoint, nid: string) {
    this.triggerEndpoint = triggerEndpoint
    this.nid = nid
  }

  tick() {

  }
}
