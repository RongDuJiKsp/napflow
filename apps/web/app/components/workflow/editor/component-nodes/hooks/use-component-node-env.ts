import { uniqBy } from 'lodash-es'
import type { WorkflowEdge } from '../../types'
import { Queue } from 'datastructures-js'
import { createContext, useContext, useMemo } from 'react'
import type { Var } from '@shared/common/workflow/component-node'
import type { ComponentNode } from '../types'
import { useWorkflowExtStore } from '../../hooks/use-workflow-ext-state'
import { useStore } from 'zustand'
export type VarCtxName = string
export type VarCtx = Var & {
  source: {
    id: string;
    title: string;
  };
}
export const getCommVarCtxName = (varctx: VarCtx): VarCtxName => {
  return `${varctx.source.id}.${varctx.name}`
}
export const getNodeEnvMap = (
  nodes: ComponentNode[],
  edges: WorkflowEdge[],
) => {
  // 检查每个节点的变量名称是否重复 重复的节点没法判断
  for (const node of nodes) {
    const n = {} as Record<string, boolean>
    for (const v of node.data.vars) {
      if (n[v.name]) throw new Error(`节点${node.id}的变量${v.name}重复`)

      n[v.name] = true
    }
  }
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

  // 对于有 parentId 的子节点（如 loop-start），将父节点视为其虚拟前驱，
  // 使得子节点能继承父节点（如 loop）的 env
  for (const node of nodes) {
    if (node.parentId && nodesMap[node.parentId]) {
      prevNodeIdMap[node.id] = prevNodeIdMap[node.id] || []
      prevNodeIdMap[node.id].push(node.parentId)
      nextNodeIdMap[node.parentId] = nextNodeIdMap[node.parentId] || []
      nextNodeIdMap[node.parentId].push(node.id)
    }
  }

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

    states.envCache[node.id] = [
      ...uniqBy(
        prevNodeIdMap[node.id]?.map(id => states.envCache[id]).flat() || [],
        se => `${se.source.id}.${se.name}`,
      ),
      //  以及节点自身vars
      ...(prevNodeIdMap[node.id]
        ?.map(id => nodesMap[id])
        .map((prevNode): VarCtx[] =>
          prevNode.data.vars.map(v => ({
            ...v,
            source: { id: prevNode.id, title: prevNode.data.title },
          })),
        )
        .flat() || []),
    ]
    // 每个节点可读取的vars为前缀节点可读取的vars之和

    // 处理下一个节点
    nextNodeIdMap[node.id]?.forEach((id) => {
      states.indgreeMap[id]--
      if (states.indgreeMap[id] === 0) queue.enqueue(nodesMap[id])
    })
  }
  return states.envCache
}

export const NodeEnvContext = createContext<Record<string, VarCtx[]>>({})

export const useComponentNodeEnv = (nodeId: string) => {
  const varsCache = useContext(NodeEnvContext)
  const localVars = useMemo(() => varsCache[nodeId] || [], [varsCache, nodeId])

  const workflowExtStore = useWorkflowExtStore()
  const envs = useStore(workflowExtStore, state => state.envs)

  const varsWithGlobal = useMemo(
    () => [
      ...localVars,
      ...envs.map(env => ({
        ...env,
        source: { id: 'global', title: '全局环境变量' },
      })),
    ],
    [localVars, envs],
  )
  return {
    vars: varsWithGlobal,
    localVars,
  }
}
