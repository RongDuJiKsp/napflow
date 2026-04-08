import { useEdges, useNodes } from '@xyflow/react'
import { useCallback, useMemo } from 'react'
import type { WorkflowEdge, WorkflowNode } from '../../types'
import { NodeClassic } from '@shared/common/workflow/core'
import type { ComponentNode } from '../types'
import { useWorkflowEditorInstance } from '../../hooks/reactflow-re-exports'

export const useComponentNodeCurd = () => {
  const reactflow = useWorkflowEditorInstance()
  const getNode = useCallback(
    (nodeId?: string) => {
      if (!nodeId) return null

      const node = reactflow.getNode(nodeId)
      if (!node) return null

      if (node.type !== NodeClassic.Component) {
        console.warn('尝试使用非Component的NodeId 获取Node')
        return null
      }
      return node as ComponentNode
    },
    [reactflow],
  )
  return {
    getNode,
  }
}

export const useComponentNodeEdges = () => {
  const wNodes = useNodes<WorkflowNode>()
  const wEdges = useEdges<WorkflowEdge>()
  const { nodes, edges } = useMemo(() => {
    const compNodes = wNodes.filter(
      node => node.type === NodeClassic.Component,
    ) as ComponentNode[]
    const compIdSet = new Set(compNodes.map(node => node.id))
    const compEdges = wEdges.filter(
      edge => compIdSet.has(edge.source) && compIdSet.has(edge.target),
    )
    return { nodes: compNodes, edges: compEdges }
  }, [wNodes, wEdges])
  return { nodes, edges }
}
