import type { StateCreator } from 'zustand'
import type { WorkflowNode } from '../types'
import type { XYPosition } from '@shared/common/workflow/re-export'
import type React from 'react'

type StickyNodeState = {
  stickyElement?: WorkflowNode,
  mouseLocation?: XYPosition
}
type StickyNodeAction = {
  stickyNewNode: (node: WorkflowNode) => void
  removeStickyElement: () => void
  handleMove: (e: React.MouseEvent) => void
}

export type StickyNodeStoreShape = StickyNodeState & StickyNodeAction

export const createStickyNodeStore: StateCreator<StickyNodeStoreShape> = set => ({
  stickyElement: undefined,
  stickyNewNode: (node: WorkflowNode) => {
    set({ stickyElement: node })
  },
  removeStickyElement: () => {
    set({ stickyElement: undefined })
  },
  mouseLocation: undefined,
  handleMove: (e: React.MouseEvent) => {
    set({ mouseLocation: { x: e.clientX, y: e.clientY } })
  },
})
