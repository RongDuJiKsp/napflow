import type { Edge as DirtyMetaEdge, Node as DirtyMetaNode } from '@shared/common/workflow/core'

type MetaNode = Pick<DirtyMetaNode, 'id'>
type MetaEdge = Pick<DirtyMetaEdge, 'source' | 'target'>

export type NeighGraph<Node extends MetaNode> = ReadonlyMap<Node, { prev: Node[], next: Node[], }>
export const buildNeighGraph = <Node extends MetaNode, Edge extends MetaEdge>(nodes: Node[], edges: Edge[]): NeighGraph<Node> => {
  const graph = new Map<Node, { prev: Node[], next: Node[] }>()
  for (const node of nodes)
    graph.set(node, { prev: [], next: [] })

  for (const edge of edges) {
    const sourceNode = nodes.find(node => node.id === edge.source)
    const targetNode = nodes.find(node => node.id === edge.target)

    if (sourceNode && targetNode) {
      graph.get(sourceNode)!.next.push(targetNode)
      graph.get(targetNode)!.prev.push(sourceNode)
    }
  }

  return graph
}
