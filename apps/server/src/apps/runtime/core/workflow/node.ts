import type { Edge, Node, NodeClassic } from '@shared/common/workflow/core'
import type { ComponentNodeMeta } from '@shared/common/workflow/component-node'
import z from 'zod'

export type CommNodeType<T extends ComponentNodeMeta> = Omit<Node, 'position'> & {
  type: NodeClassic.Component
  data: T
}

export const CommEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
})
export type CommEdgeType = z.infer<typeof CommEdgeSchema>

export class CommNode<T extends ComponentNodeMeta = ComponentNodeMeta> implements CommNodeType<T> {
  id: string
  // 只有组件节点能跑 所以type固定为Component
  type: NodeClassic.Component
  data: T

  constructor(data: CommNodeType<T>) {
    Object.assign(this, data)
  }

  static parse<U extends ComponentNodeMeta>(schema: z.ZodType<CommNodeType<U>>, data: Node | Record<string, any>): CommNode<U> {
    return new CommNode(schema.parse(data))
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
