import { Item, Menu } from 'react-contexify'
import { EDITOR_PANEL_ID } from '../../constants'
import { memo, useCallback } from 'react'
import CreateComponentNodeSubMenu from './CreateComponentNodeSubMenu'
import { createNoteNode } from '../../note/utils'
import { overwrite } from '@/utils/comm'
import { useStore } from 'zustand'
import { useEditorStore } from '../../hooks/use-editor-store'
import { RiStickyNoteLine } from '@remixicon/react'

const EditPanelContextMenu = () => {
  const editorStore = useEditorStore()
  const stickyNode = useStore(editorStore, state => state.stickyNewNode)

  const handleCreateNote = useCallback(() => {
    const node = createNoteNode()
    stickyNode(overwrite(node, { data: { _beforeCreate: true } }))
  }, [stickyNode])

  return (
    <Menu id={EDITOR_PANEL_ID}>
      <CreateComponentNodeSubMenu />
      <Item onClick={handleCreateNote}>
        <div className="flex gap-3 items-center w-full">
          <RiStickyNoteLine className="w-5 h-5" />
          <span className="text-md">创建备注节点</span>
        </div>
      </Item>
    </Menu>
  )
}

export default memo(EditPanelContextMenu)
