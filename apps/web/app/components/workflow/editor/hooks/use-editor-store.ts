import type { StateCreator, StoreApi } from 'zustand'
import { createStore } from 'zustand'
import { type NodeEditorStoreShape, createNodeEditorStore } from '../store/node-editor'
import { createContext, useContext } from 'react'

type Shape = NodeEditorStoreShape
export const createEditorStore = () => {
  return createStore<Shape>((...args: Parameters<StateCreator<Shape>>) => ({
    ...createNodeEditorStore(...args),
  }))
}

export const EditorStoreContext = createContext<StoreApi<Shape> | null>(null)

export const useEditorStore = () => {
  const store = useContext(EditorStoreContext)
  if (!store)
    throw new Error('useEditorStore must be used within a EditorStoreProvider')

  return store
}
