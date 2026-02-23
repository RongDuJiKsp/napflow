'use client'
import { type PropsWithChildren, memo } from 'react'
import {
  EditorOutsideStoreContext,
  createEditorOutsideStore,
} from '../hooks/use-editor-outside-store'
import { useCreation } from 'ahooks'

const StoreOutsideProvider = ({ children }: PropsWithChildren) => {
  const editorOutsideStore = useCreation(createEditorOutsideStore, [])
  return (
    <EditorOutsideStoreContext.Provider value={editorOutsideStore}>
      {children}
    </EditorOutsideStoreContext.Provider>
  )
}

export default memo(StoreOutsideProvider)
