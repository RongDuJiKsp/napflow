import { Menu } from 'react-contexify'
import { EDITOR_PANEL_ID } from '../../constants'
import { memo } from 'react'
import CreateComponentNodeSubMenu from './CreateComponentNodeSubMenu'

const EditPanelContextMenu = () => {
  return (
    <Menu id={EDITOR_PANEL_ID}>
      <CreateComponentNodeSubMenu />
    </Menu>
  )
}

export default memo(EditPanelContextMenu)
