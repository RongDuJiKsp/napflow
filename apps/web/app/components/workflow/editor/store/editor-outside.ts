import type { StateCreator } from 'zustand'

type EditorOutsideStoreState = {
  isEnvWindowOpen: boolean;
}

type NodeEditorOutsideAction = {
  openEnvWindow: () => void;
  closeEnvWindow: () => void;
}

export type EditorOutsideStoreShape = EditorOutsideStoreState
  & NodeEditorOutsideAction

export const createEditorOutsideStoreShape: StateCreator<EditorOutsideStoreShape> = set => ({
  isEnvWindowOpen: false,
  openEnvWindow: () => set({ isEnvWindowOpen: true }),
  closeEnvWindow: () => set({ isEnvWindowOpen: false }),
})
