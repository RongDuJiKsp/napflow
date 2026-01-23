import { useStore } from 'zustand'
import { useEditorStore } from '../../../hooks/use-editor-store'
import { nodeTypes } from '../../../constants'
import { useMemo } from 'react'
import { useEventListener } from 'ahooks'
import { useReactFlow } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode, WorkflowProps } from '../../../types'
import { useWorkflowDraft } from '../../../hooks/use-workflow-draft'
import { overwrite } from '@/utils/comm'

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
  const editorStore = useEditorStore()
  const { submitSyncDraft } = useWorkflowDraft()
  useEventListener('click', (e) => {
    const { stickyElement, removeStickyElement } = editorStore.getState()
    if (!stickyElement) return
    reactflow.addNodes(
      overwrite(stickyElement, {
        position: reactflow.screenToFlowPosition({ x: e.pageX, y: e.pageY }),
        data: {
          _beforeCreate: false,
        },
      }),
    )
    removeStickyElement()
    submitSyncDraft()
  })
}
