import type { StateCreator } from 'zustand'

type NodeEditorState = {
  selectedNodeId?: string
}
type NodeEditorAction = {
  selectNode: (nodeId: string) => void
  deselectNode: () => void
}

export type NodeEditorStoreShape = NodeEditorState & NodeEditorAction

export const createNodeEditorStore: StateCreator<NodeEditorStoreShape> = set => ({
  selectedNodeId: undefined,
  selectNode: (nodeId: string) => {
    set({ selectedNodeId: nodeId })
  },
  deselectNode: () => {
    set({ selectedNodeId: undefined })
  },
})
