import type { Edge, Node } from '@shared/common/workflow/core'

export type NeighGraph = ReadonlyMap<Node, { prev: Node[], next: Node[], }>
export const buildNeighGraph = (nodes: Node[], edges: Edge[]): NeighGraph => {
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
