import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import type { WorkflowNode } from '../../types'
import { NodeClassic } from '@shared/common/workflow/core'
import type { ComponentNode } from '../types'

export const useComponentNodeCurd = () => {
  const reactflow = useReactFlow<WorkflowNode>()
  const getNode = useCallback((nodeId?: string) => {
    if(!nodeId)
      return null

    const node = reactflow.getNode(nodeId)
    if(!node)
      return null

    if(node.type !== NodeClassic.Component) {
      console.warn('尝试使用非Component的NodeId 获取Node')
      return null
    }
    return node as ComponentNode
  }, [reactflow])
  return {
    getNode,
  }
}
