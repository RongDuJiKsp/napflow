import { createParamContext } from '@/utils/react'
import type { StoreApi } from 'zustand'
import { createStore } from 'zustand'
import { type EditorOutsideStoreShape, createEditorOutsideStoreShape } from '../store/editor-outside'

export const createEditorOutsideStore = () =>
  createStore<EditorOutsideStoreShape>((...args) => ({
    ...createEditorOutsideStoreShape(...args),
  }))

const {
  context: EditorOutsideStoreContext,
  useContextHook: useEditorOutsideStore,
} = createParamContext<StoreApi<EditorOutsideStoreShape>>(
  'editor-outside-store',
)

export { EditorOutsideStoreContext, useEditorOutsideStore }
