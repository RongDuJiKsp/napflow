import { type Edge, type Node, NodeClassic, ZodCheckNode } from '@shared/common/workflow/core'
import type { ComponentNodeMeta } from '@shared/common/workflow/component-node'
import z from 'zod'
import type { Class } from 'type-fest'

export enum CommNodeRole {
  Trigger = 'trigger',
  Action = 'action',
}

export const defineCommNodeSchema = <T extends ComponentNodeMeta = ComponentNodeMeta>(data: z.ZodType<T>) => ZodCheckNode.omit({ position: true, type: true }).extend({
  type: z.enum([NodeClassic.Component]),
  data,
})
export type CommNodeType<T extends ComponentNodeMeta = ComponentNodeMeta> = Omit<Node, 'position' | 'type'> & {
  type: NodeClassic.Component
  data: T
}

export const CommEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
})
export type CommEdgeType = z.infer<typeof CommEdgeSchema>

export abstract class CommNode<T extends ComponentNodeMeta = ComponentNodeMeta> implements CommNodeType<T> {
  readonly id: string
  // 只有组件节点能跑 所以type固定为Component
  readonly type: NodeClassic.Component
  readonly data: T
  abstract readonly role: CommNodeRole

  constructor(data: CommNodeType<T>) {
    Object.assign(this, data)
  }

  static parse<U extends ComponentNodeMeta>(schema: z.ZodType<CommNodeType<U>>, data: Node | Record<string, any>, Klass: Class<CommNode<U>>): CommNode<U> {
    return new Klass(schema.parse(data))
  }
}

export class CommEdge implements CommEdgeType {
  id: string
  source: string
  target: string

  constructor(data: CommEdgeType) {
    Object.assign(this, data)
  }

  static parse(data: Edge | Record<string, any>): CommEdge {
    return new CommEdge(CommEdgeSchema.parse(data))
  }
}
