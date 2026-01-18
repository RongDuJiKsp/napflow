import type { WorkflowEdge } from '../../types'
import type { ComponentNode, Var } from '../types'
import { Queue } from 'datastructures-js'
export const getNodeEnvMap = (nodes: ComponentNode[], edges: WorkflowEdge[]) => {
    // 前缀节点
  const prevNodeIdMap = edges.reduce((acc, cur) => {
    acc[cur.target] = (acc[cur.target] || [])
    acc[cur.target].push(cur.source)
    return acc
  }, {} as Record<string, string[]>)
  const nextNodeIdMap = edges.reduce((acc, cur) => {
    acc[cur.source] = (acc[cur.source] || [])
    acc[cur.source].push(cur.target)
    return acc
  }, {} as Record<string, string[]>)

  const states = {
    indgreeMap: Object.fromEntries(Object.entries(prevNodeIdMap).map(([key, value]) => [key, value.length])),
    envCache: {} as Record<string, Var[]>,
  }
  const queue = new Queue<ComponentNode>(nodes.filter(node => !states.indgreeMap[node.id]))

  while (!queue.isEmpty()) {
    const node = queue.dequeue()!
    // 每个节点可读取的vars为前缀节点可读取的vars之和
    states.envCache[node.id] = new Array<Var>().concat(
      ...(prevNodeIdMap[node.id]?.map(id => states.envCache[id]) || []),
    )

    // 处理下一个节点
    nextNodeIdMap[node.id]?.forEach((id) => {
      states.indgreeMap[id]--
      if (states.indgreeMap[id] === 0)
        queue.enqueue(nodes.find(n => n.id === id)!)
    })
  }
  return states.envCache
}

export const useComponentNodeEnv = () => {
  return {}
}
