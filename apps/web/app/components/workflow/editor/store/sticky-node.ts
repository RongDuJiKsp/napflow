import type { StateCreator } from 'zustand'
import type { WorkflowNodeData } from '../types'
import type { XYPosition } from '@shared/common/workflow/re-export'
import type React from 'react'

type StickyNodeState = {
  stickyElement?: WorkflowNodeData,
  mouseLocation?: XYPosition
}
type StickyNodeAction = {
  stickyNewNode: (nodeData: WorkflowNodeData) => void
  removeStickyElement: () => void
  handleMove: (e: React.MouseEvent) => void
}

export type StickyNodeStoreShape = StickyNodeState & StickyNodeAction

export const createStickyNodeStore: StateCreator<StickyNodeStoreShape> = set => ({
  stickyElement: undefined,
  stickyNewNode: (nodeData: WorkflowNodeData) => {
    set({ stickyElement: nodeData })
  },
  removeStickyElement: () => {
    set({ stickyElement: undefined })
  },
  mouseLocation: undefined,
  handleMove: (e: React.MouseEvent) => {
    set({ mouseLocation: { x: e.clientX, y: e.clientY } })
  },
})
