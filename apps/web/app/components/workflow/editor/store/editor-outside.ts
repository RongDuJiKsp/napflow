import type { StateCreator } from 'zustand'

type EditorOutsideStoreState = {
  isEnvWindowOpen: boolean;
  isAgentWindowOpen: boolean;
}

type NodeEditorOutsideAction = {
  openEnvWindow: () => void;
  closeEnvWindow: () => void;
  openAgentWindow: () => void;
  closeAgentWindow: () => void;
}

export type EditorOutsideStoreShape = EditorOutsideStoreState
  & NodeEditorOutsideAction

export const createEditorOutsideStoreShape: StateCreator<
  EditorOutsideStoreShape
> = set => ({
  isEnvWindowOpen: false,
  isAgentWindowOpen: false,
  openEnvWindow: () => set({ isEnvWindowOpen: true }),
  closeEnvWindow: () => set({ isEnvWindowOpen: false }),
  openAgentWindow: () => set({ isAgentWindowOpen: true }),
  closeAgentWindow: () => set({ isAgentWindowOpen: false }),
})
