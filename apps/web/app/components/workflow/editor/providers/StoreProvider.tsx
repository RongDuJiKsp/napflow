import { useCreation } from 'ahooks'
import {
  EditorStoreContext,
  createEditorStore,
} from '../hooks/use-editor-store'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'

const StoreProvider = ({ children }: PropsWithChildren) => {
  const editorStore = useCreation(createEditorStore, [])

  return (
    <EditorStoreContext.Provider value={editorStore}>
      {children}
    </EditorStoreContext.Provider>
  )
}
export default memo(StoreProvider)
