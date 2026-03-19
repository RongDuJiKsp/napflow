import {
  type Edge,
  type Node,
  NodeClassic,
  ZodCheckNode,
} from '@shared/common/workflow/core'
import type { ComponentNodeMeta } from './zod/meta'
import z from 'zod'
import type { Class } from 'type-fest'
import type { WorkflowThread } from './pool'
import type { WillTask } from '@/src/utils/task-pool'
import { merge } from 'lodash-es'

export enum CommNodeRole {
  Trigger = 'trigger',
  Action = 'action',
}
export enum TriggerOnEvents {
  ChatMessage = 'chatMessage', // 聊天触发的消息 这时候kv里面有hmsg(人类可读文本), gid(群id)或 uid(用户id)
  Timer = 'timer', // 定时器触发 这时候kv里面有 当前时间 time(unix秒钟时间戳) 系统启动时间 mountAt(unix秒钟时间戳) 系统启动了多少秒 uptime(已运行秒数, elapsed seconds since mountAt)

}

export const defineCommNodeSchema = <
  T extends ComponentNodeMeta = ComponentNodeMeta,
>(
  data: z.ZodType<T>,
) =>
  ZodCheckNode.omit({ position: true, type: true }).extend({
    type: z.enum([NodeClassic.Component]),
    data,
  })
export type CommNodeType<T extends ComponentNodeMeta = ComponentNodeMeta>
  = Omit<Node, 'position' | 'type'> & {
    type: NodeClassic.Component;
    data: T;
  }

export const CommEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
})
export type CommEdgeType = z.infer<typeof CommEdgeSchema>

export abstract class CommNode<
  T extends ComponentNodeMeta = ComponentNodeMeta,
> implements CommNodeType<T> {
  readonly id: string
  // 只有组件节点能跑 所以type固定为Component
  readonly type: NodeClassic.Component
  readonly parentId?: string
  readonly data: T
  abstract readonly role: CommNodeRole

  constructor(data: CommNodeType<T>) {
    Object.assign(this, data)
  }

  static parse<U extends ComponentNodeMeta>(
    schema: z.ZodType<CommNodeType<U>>,
    data: Node | Record<string, any>,
    Klass: Class<CommNode<U>>,
  ): CommNode<U> {
    return new Klass(schema.parse(data))
  }

  abstract onThread(
    thread: WorkflowThread,
    nextTask: WillTask,
    nkv: Record<string, any>,
  ): void | Promise<void>
}

export type CommTrigger = {
  role: CommNodeRole.Trigger;
  triggerEv: TriggerOnEvents;
}

export class CommEdge implements CommEdgeType {
  id: string
  source: string
  target: string

  constructor(data: CommEdgeType) {
    merge(this, data)
  }

  static parse(data: Edge | Record<string, any>): CommEdge {
    return new CommEdge(CommEdgeSchema.parse(data))
  }
}
