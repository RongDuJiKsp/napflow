import { uniqBy } from 'lodash-es'
import type { WorkflowEdge } from '../../types'
import { Queue } from 'datastructures-js'
import { createContext, useContext, useMemo } from 'react'
import {
  ComponentNodesEnum,
  type Var,
  VarTypes,
} from '@shared/common/workflow/component-node'
import type { ComponentNode } from '../types'
import { useWorkflowExtStore } from '../../hooks/use-workflow-ext-state'
import { useStore } from 'zustand'
import type { IterateData } from '@shared/common/workflow/node-data/iterate'
import { safeAssertComponentNode } from '../utils/node-asserts'
export type VarCtxName = string
export type VarCtx = Var & {
  source: {
    id: string;
    title: string;
  };
}
export const getVarCtxName = (sourceId: string, name: string): VarCtxName => {
  return `${sourceId}.${name}`
}
export const getCommVarCtxName = (varctx: VarCtx): VarCtxName => {
  return getVarCtxName(varctx.source.id, varctx.name)
}

/**
 * @description 获取Array类型的Item类型
 */
export const getArrayElementVarType = (
  type: Var['type'],
): VarTypes.String | VarTypes.Number => {
  if (type === VarTypes.NumberArray) return VarTypes.Number
  else if (type === VarTypes.StringArray) return VarTypes.String
  throw new Error(`Unsupported array type: ${type}`)
}

export const getIterateStartOutputVar = (parentNode: ComponentNode<IterateData>, parentVars: VarCtx[]): Var | null => {
  const sourceVar = parentVars.find(v => getCommVarCtxName(v) === parentNode.data.sourceVarName)
  if (!sourceVar) return null
  return {
    name: 'iter.item',
    type: getArrayElementVarType(sourceVar.type) as VarTypes,
  }
}

/**
 * @description 处理 迭代器起点 这一特殊节点 这个节点的env需要从parent的env里根据 表单项sourceVarName计算得到
 */
export const getIterateStartOutputVars = (node: ComponentNode, nodesMap: Record<string, ComponentNode>, envCache: Record<string, VarCtx[]>): Var[] => {
  const originalVars = node.data.vars || []
  if (!node.parentId) return originalVars
  const parentIterateNode = safeAssertComponentNode(ComponentNodesEnum.Iterate, nodesMap[node.parentId])
  if (!parentIterateNode) return originalVars
  const parentIterateVars = envCache[parentIterateNode.id]! // 这里有向图一定是父节点指向子节点的 之前拓扑排序时保证了父节点在子节点之前处理完 所以父节点的envCache一定已经计算好了
  const iterateStartVar = getIterateStartOutputVar(parentIterateNode, parentIterateVars)
  return[...originalVars, iterateStartVar].filter(Boolean) as Var[]
}

export const getNodeEnvMap = <GEdge extends WorkflowEdge>(
  nodes: ComponentNode[],
  edges: GEdge[],
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

  const getNodeOutputVars = (node: ComponentNode): Var[] => {
    if (node.data.type === ComponentNodesEnum.IterateStart)
      return getIterateStartOutputVars(node, nodesMap, states.envCache)
    return node.data.vars
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
          getNodeOutputVars(prevNode).map(v => ({
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
