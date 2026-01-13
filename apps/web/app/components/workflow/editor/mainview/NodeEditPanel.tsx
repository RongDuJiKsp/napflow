import { Drawer } from 'antd'
import { memo } from 'react'
import { useEditorStore } from '../hooks/use-editor-store'
import { useStore } from 'zustand'

const NodeEditPanel = () => {
  const editorStore = useEditorStore()
  const currNodeId = useStore(editorStore, state => state.selectedNodeId)
  return (
    <Drawer open={!!currNodeId}>
      hello world {currNodeId}
    </Drawer>
  )
}
export default memo(NodeEditPanel)
