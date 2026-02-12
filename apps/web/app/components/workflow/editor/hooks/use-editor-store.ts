import type { StateCreator, StoreApi } from 'zustand'
import { createStore } from 'zustand'
import {
  type NodeEditorStoreShape,
  createNodeEditorStore,
} from '../store/node-editor'
import type { StickyNodeStoreShape } from '../store/sticky-node'
import { createStickyNodeStore } from '../store/sticky-node'
import { createParamContext } from '@/utils/react'

type Shape = NodeEditorStoreShape & StickyNodeStoreShape
export const createEditorStore = () => {
  return createStore<Shape>((...args: Parameters<StateCreator<Shape>>) => ({
    ...createNodeEditorStore(...args),
    ...createStickyNodeStore(...args),
  }))
}

const { context: EditorStoreContext, useContextHook: useEditorStore }
  = createParamContext<StoreApi<Shape>>('editor-store')

export { EditorStoreContext, useEditorStore }
