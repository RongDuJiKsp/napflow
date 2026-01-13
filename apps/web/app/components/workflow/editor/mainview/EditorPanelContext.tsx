import { Menu, Submenu } from 'react-contexify'
import { EDITOR_PANEL_ID } from '../constants'
import { memo } from 'react'

const EditPanelContext = () => {
  return (
    <Menu id={EDITOR_PANEL_ID}>
      <Submenu label='创建节点'>
        Hello World
      </Submenu>
    </Menu>
  )
}

export default memo(EditPanelContext)
