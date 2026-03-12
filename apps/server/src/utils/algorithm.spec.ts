import { describe, expect, it } from 'vitest'

import { buildNeighGraph, getConnectedNodes } from './algorithm'

type TestNode = { id: string; label: string }
type TestEdge = { source: string; target: string }

describe('getConnectedNodes', () => {
  it('returns all nodes in the same connected component', () => {
    const nodes: TestNode[] = [
      { id: 'A', label: 'A' },
      { id: 'B', label: 'B' },
      { id: 'C', label: 'C' },
      { id: 'D', label: 'D' },
      { id: 'E', label: 'E' },
    ]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
      { source: 'D', target: 'E' },
    ]

    const graph = buildNeighGraph(nodes, edges)

    const connected = getConnectedNodes(graph, 'B')
    const connectedIds = new Set([...connected].map(node => node.id))

    expect(connectedIds).toEqual(new Set(['A', 'B', 'C']))
  })

  it('handles cycles without infinite loop', () => {
    const nodes: TestNode[] = [
      { id: 'A', label: 'A' },
      { id: 'B', label: 'B' },
      { id: 'C', label: 'C' },
    ]
    const edges: TestEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
      { source: 'C', target: 'A' },
    ]

    const graph = buildNeighGraph(nodes, edges)

    const connected = getConnectedNodes(graph, 'A')
    const connectedIds = new Set([...connected].map(node => node.id))

    expect(connectedIds).toEqual(new Set(['A', 'B', 'C']))
  })

  it('returns empty set when node id does not exist', () => {
    const nodes: TestNode[] = [
      { id: 'A', label: 'A' },
      { id: 'B', label: 'B' },
    ]
    const edges: TestEdge[] = [{ source: 'A', target: 'B' }]

    const graph = buildNeighGraph(nodes, edges)

    const connected = getConnectedNodes(graph, 'Z')

    expect(connected.size).toBe(0)
  })
})
