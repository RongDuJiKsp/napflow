import type { Connection } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import type { WorkflowEdge, WorkflowNode } from '../types'
import { NodeClassic } from '@shared/common/workflow/core'
import { useComponentNodeOperations } from '../component-nodes/hooks/use-component-node-operations'
import type { ComponentNode } from '../component-nodes/types'
import { useWorkflowDraft } from './use-workflow-draft'

export const useWorkflowViewOperations = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { submitSyncDraft } = useWorkflowDraft()
  const { handleConnenct: handleComponentNodeConnect } = useComponentNodeOperations()
  const handleConnect = useCallback(({ source, target }: Connection) => {
    const sourceNode = reactflow.getNode(source)
    const targetNode = reactflow.getNode(target)
    if (!sourceNode || !targetNode || reactflow.getEdges().find(e => e.source === source && e.target === target)) return
    if(sourceNode.type === NodeClassic.Component && targetNode.type === NodeClassic.Component)
      handleComponentNodeConnect(sourceNode as ComponentNode, targetNode as ComponentNode)
    submitSyncDraft()
  }, [reactflow, handleComponentNodeConnect, submitSyncDraft])
  return { handleConnect }
}
