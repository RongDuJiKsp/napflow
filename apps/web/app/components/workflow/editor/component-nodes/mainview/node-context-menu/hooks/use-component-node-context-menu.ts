import { useCallback } from 'react'
import type { ItemParams } from 'react-contexify'
import type { ComponentNode, ComponentNodeProps } from '../../../types'
import { useComponentNodeOperations } from '../../../hooks/use-component-node-operations'
import { useReactFlow } from '@xyflow/react'
import type { WorkflowNode } from '../../../../types'
import { NodeClassic } from '@shared/common/workflow/core'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'
type HandlerProps = ItemParams<ComponentNodeProps>

export const useComponentNodeContextMenu = () => {
  const reactflow = useReactFlow<WorkflowNode>()
  const { handleDeleteNode } = useComponentNodeOperations()
  const { submitSyncDraft } = useWorkflowDraft()
  const handleDeleteItem = useCallback(({ props }: HandlerProps) => {
    if(!props) {
      console.error('Why props is undefined?')
      return
    }
    const node = reactflow.getNode(props.id)
    if(!node || node.type !== NodeClassic.Component) {
      console.error('Why node is undefined or not a component node?')
      return
    }
    handleDeleteNode(node as ComponentNode)
    submitSyncDraft()
  }, [handleDeleteNode, submitSyncDraft, reactflow])
  return {
    handleDeleteItem,
  }
}
