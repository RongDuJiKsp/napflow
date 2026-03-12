import type {
  Edge as DirtyMetaEdge,
  Node as DirtyMetaNode,
} from '@shared/common/workflow/core'

type MetaNode = Pick<DirtyMetaNode, 'id'>
type MetaEdge = Pick<DirtyMetaEdge, 'source' | 'target'>

export type NeighGraph<Node extends MetaNode> = ReadonlyMap<
  Node,
  { prev: Node[]; next: Node[] }
>
export const buildNeighGraph = <Node extends MetaNode, Edge extends MetaEdge>(
  nodes: Node[],
  edges: Edge[],
): NeighGraph<Node> => {
  const graph = new Map<Node, { prev: Node[]; next: Node[] }>()
  for (const node of nodes) graph.set(node, { prev: [], next: [] })

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

export const getConnectedNodes = <Node extends MetaNode>(
  graph: NeighGraph<Node>,
  nodeId: string,
): Set<Node> => {
  const visited = new Set<Node>()
  const startNode = [...graph.keys()].find(n => n.id === nodeId)
  if (!startNode) return visited

  const stack = [startNode]
  while (stack.length > 0) {
    const current = stack.pop()!
    if (visited.has(current)) continue
    visited.add(current)
    const neighbors = graph.get(current)!
    for (const n of neighbors.prev) if (!visited.has(n)) stack.push(n)
    for (const n of neighbors.next) if (!visited.has(n)) stack.push(n)
  }
  return visited
}

export const buildIdCache = <T extends { id: string }>(arr: T[]) =>
  Object.fromEntries(arr.map(item => [item.id, item]))
