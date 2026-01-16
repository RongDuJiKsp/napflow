import { useCallback } from 'react'
import type { ComponentNode } from '../types'
import { ComponentNodeCreatorMap } from '../constants'
import { useReactFlow } from '@xyflow/react'
import { createWorkflowEdge } from '../../utils/nodes'

export const useComponentNodeOperations = () => {
  const reactflow = useReactFlow()
  const handleConnenct = useCallback((source: ComponentNode, target: ComponentNode) => {
    const sourceCreator = ComponentNodeCreatorMap[source.data.type]
    const targetCreator = ComponentNodeCreatorMap[target.data.type]
    if(!sourceCreator.nextNodes?.includes(target.data.type) || !targetCreator.prevNodes?.includes(source.data.type)) return
    reactflow.addEdges(createWorkflowEdge({ source: source.id, target: target.id }))
  }, [reactflow])
  return { handleConnenct }
}
