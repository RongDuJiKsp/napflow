import { createParamContext } from '@/utils/react'
import type { StoreApi } from 'zustand'
import { createStore } from 'zustand'

type EditorOutsideStoreState = {
  isEnvWindowOpen: boolean;
}

type NodeEditorOutsideAction = {
  openEnvWindow: () => void;
  closeEnvWindow: () => void;
}

export type EditorOutsideStoreShape = EditorOutsideStoreState & NodeEditorOutsideAction

export const createEditorOutsideStore = () => createStore<EditorOutsideStoreShape>(set => ({
  isEnvWindowOpen: false,
  openEnvWindow: () => set({ isEnvWindowOpen: true }),
  closeEnvWindow: () => set({ isEnvWindowOpen: false }),
}))

const { context: EditorOutsideStoreContext, useContextHook: useEditorOutsideStore } = createParamContext<StoreApi<EditorOutsideStoreShape>>('editor-outside-store')

export { EditorOutsideStoreContext, useEditorOutsideStore }
