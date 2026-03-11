import { useStore } from 'zustand'
import { useEditorStore } from '../../../hooks/use-editor-store'
import { nodeTypes } from '../../../constants'
import { useMemo } from 'react'
import { useEventListener } from 'ahooks'
import { useReactFlow } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode, WorkflowProps } from '../../../types'
import { useWorkflowDraft } from '../../../hooks/use-workflow-draft'
import { overwrite } from '@/utils/comm'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { NodeClassic } from '@shared/common/workflow/core'
import type { ComponentNode } from '../../../component-nodes/types'
import { useLoopNodeOperator } from '../../../component-nodes/nodes/loop/hooks/use-loop-operator'
import { useIterateNodeOperator } from '../../../component-nodes/nodes/iterate/hooks/use-iterate-operator'

export const useStickyNode = () => {
  const editorStore = useEditorStore()
  const stickyNode = useStore(editorStore, state => state.stickyElement)
  const stickyLocation = useStore(editorStore, state => state.mouseLocation)
  const StickyElement = useMemo(
    () => (stickyNode ? nodeTypes[stickyNode.type] : null),
    [stickyNode],
  )
  const stickyElementProps = useMemo(
    (): WorkflowProps | null =>
      stickyNode
        ? {
          ...stickyNode,
          draggable: true,
          dragging: true,
          selectable: false,
          selected: false,
          deletable: false,
          isConnectable: false,
          zIndex: 0,
          positionAbsoluteX: stickyLocation?.x ?? 0,
          positionAbsoluteY: stickyLocation?.y ?? 0,
        }
        : null,
    [stickyNode, stickyLocation],
  )
  return {
    stickyNode,
    stickyLocation,
    StickyElement,
    stickyElementProps,
  }
}

export const useStickyEventsRegister = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { handleAddLoopNode } = useLoopNodeOperator()
  const { handleMoveConstructorIterateNode } = useIterateNodeOperator()
  const editorStore = useEditorStore()
  const { submitSyncDraft } = useWorkflowDraft()
  useEventListener('click', (e) => {
    const { stickyElement, removeStickyElement } = editorStore.getState()
    if (!stickyElement) return
    const position = reactflow.screenToFlowPosition({ x: e.pageX, y: e.pageY })
    const placedNode = overwrite(stickyElement, {
      position,
      data: {
        _beforeCreate: false,
      },
    })

    // 如果放置的是 Loop 节点，调用loop operations
    if (
      placedNode.type === NodeClassic.Component
      && (placedNode as ComponentNode).data.type === ComponentNodesEnum.Loop
    )
      handleAddLoopNode(placedNode)
          // 如果放置的是 Iterate  operations
    else if (
      placedNode.type === NodeClassic.Component
      && (placedNode as ComponentNode).data.type === ComponentNodesEnum.Iterate
    )
      handleMoveConstructorIterateNode(placedNode)
    else reactflow.addNodes(placedNode)

    removeStickyElement()
    submitSyncDraft()
  })
}
