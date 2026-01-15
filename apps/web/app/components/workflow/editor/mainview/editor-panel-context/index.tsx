import { Menu } from 'react-contexify'
import { EDITOR_PANEL_ID } from '../../constants'
import { memo } from 'react'
import CreateComponentNodeSubMenu from './CreateComponentNodeSubMenu'

const EditPanelContext = () => {
  return (
    <Menu id={EDITOR_PANEL_ID}>
      <CreateComponentNodeSubMenu />
    </Menu>
  )
}

export default memo(EditPanelContext)
