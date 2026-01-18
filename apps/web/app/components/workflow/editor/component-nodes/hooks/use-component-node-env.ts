import type { WorkflowEdge } from '../../types'
import type { ComponentNode, Var } from '../types'
import { Queue } from 'datastructures-js'
export type VarCtx = Var & {
  source: {
    id: string;
    title: string;
  };
}
export const getNodeEnvMap = (
  nodes: ComponentNode[],
  edges: WorkflowEdge[],
) => {
  // 前缀节点
  const prevNodeIdMap = edges.reduce(
    (acc, cur) => {
      acc[cur.target] = acc[cur.target] || []
      acc[cur.target].push(cur.source)
      return acc
    },
    {} as Record<string, string[]>,
  )
  const nextNodeIdMap = edges.reduce(
    (acc, cur) => {
      acc[cur.source] = acc[cur.source] || []
      acc[cur.source].push(cur.target)
      return acc
    },
    {} as Record<string, string[]>,
  )
  const nodesMap = nodes.reduce(
    (acc, cur) => {
      acc[cur.id] = cur
      return acc
    },
    {} as Record<string, ComponentNode>,
  )

  const states = {
    indgreeMap: Object.fromEntries(
      Object.entries(prevNodeIdMap).map(([key, value]) => [key, value.length]),
    ),
    envCache: {} as Record<string, VarCtx[]>,
  }
  const queue = new Queue<ComponentNode>(
    nodes.filter(node => !states.indgreeMap[node.id]),
  )

  while (!queue.isEmpty()) {
    const node = queue.dequeue()!

    states.envCache[node.id] = new Array<VarCtx>().concat(
      // 每个节点可读取的vars为前缀节点可读取的vars之和
      ...(prevNodeIdMap[node.id]?.map(id => states.envCache[id]) || []),
      //  以及节点自身vars
      ...(prevNodeIdMap[node.id]
        ?.map(id => nodesMap[id])
        .map(prevNode =>
          prevNode.data.vars.map(v => ({
            ...v,
            source: { id: prevNode.id, title: prevNode.data.title },
          })),
        ) || []),
    )

    // 处理下一个节点
    nextNodeIdMap[node.id]?.forEach((id) => {
      states.indgreeMap[id]--
      if (states.indgreeMap[id] === 0) queue.enqueue(nodesMap[id])
    })
  }
  return states.envCache
}

export const useComponentNodeEnv = () => {
  return {}
}
