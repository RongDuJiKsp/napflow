import type { Edge, Node, NodeClassic } from '@shared/common/workflow/core'

export class CommNode<T> implements Pick<Node, 'id' | 'type' | 'data'> {
  id: string
  type: NodeClassic.Component
  data: T
}

export class NapcatWsTriggerPlugin {
  constructor(private readonly nodes: Node[], private readonly edges: Edge[]) {

  }
}
