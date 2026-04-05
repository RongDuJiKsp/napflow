import type { WorkflowEdge, WorkflowNode } from '@/test/utils'
import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'

export const useEditorViewOperators = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()

  const handleFocusOrigin = useCallback(() => {
    reactflow.setCenter(0, 0, {
      zoom: 1,
      duration: 300,
    })
  }, [reactflow])

  const handleArrangeNodes = useCallback(() => {
    console.info('[workflow-editor] TODO: arrange nodes')
  }, [])

  return {
    handleFocusOrigin,
    handleArrangeNodes,
  }
}
