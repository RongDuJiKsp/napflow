import { Item, Menu, Submenu } from 'react-contexify'
import { EDITOR_PANEL_ID } from '../constants'
import { memo } from 'react'
import { ComponentNodeCreatorMap } from '../nodes/constants'
import type { ComponentNodesEnum } from '../nodes/types'

const traggerCreators = Object.entries(ComponentNodeCreatorMap).map(([key, value]) => ({
  type: key as ComponentNodesEnum,
  creator: value,
}))
const EditPanelContext = () => {
  return (
    <Menu id={EDITOR_PANEL_ID}>
      <Submenu label='创建组件节点'>
        {traggerCreators.map(item => (<Item key={item.type}>
          <div className='flex justify-between items-center w-full'>
            <item.creator.icon className='w-3 h-3' />
            <span>{item.creator.label}</span>
          </div>
        </Item>))}
      </Submenu>
    </Menu>
  )
}

export default memo(EditPanelContext)
