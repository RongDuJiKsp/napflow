import { Item, Menu } from 'react-contexify'
import { EDITOR_PANEL_ID } from '../constants'
import { memo } from 'react'

const EditPanelContext = () => {
  return (
    <Menu id={EDITOR_PANEL_ID}>
      <Item>
        Hello World
      </Item>
    </Menu>
  )
}

export default memo(EditPanelContext)
