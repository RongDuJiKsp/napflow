import type { StateCreator, StoreApi } from 'zustand'
import { createStore } from 'zustand'
import {
  type NodeEditorStoreShape,
  createNodeEditorStoreShape,
} from '../store/node-editor'
import type { StickyNodeStoreShape } from '../store/sticky-node'
import { createStickyNodeStoreShape } from '../store/sticky-node'
import { createParamContext } from '@/utils/react'

type Shape = NodeEditorStoreShape & StickyNodeStoreShape
export const createEditorStore = () => {
  return createStore<Shape>((...args: Parameters<StateCreator<Shape>>) => ({
    ...createNodeEditorStoreShape(...args),
    ...createStickyNodeStoreShape(...args),
  }))
}

const { context: EditorStoreContext, useContextHook: useEditorStore }
  = createParamContext<StoreApi<Shape>>('editor-store')

export { EditorStoreContext, useEditorStore }
