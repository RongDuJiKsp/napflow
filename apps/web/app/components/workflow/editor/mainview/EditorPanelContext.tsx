import { Item, Menu, Submenu } from 'react-contexify'
import { EDITOR_PANEL_ID } from '../constants'
import { memo } from 'react'
import { ComponentNodeCreatorMap } from '../component-nodes/constants'
import type { ComponentNodesEnum } from '../component-nodes/types'

const traggerCreators = Object.entries(ComponentNodeCreatorMap).map(([key, value]) => ({
  type: key as ComponentNodesEnum,
  creator: value,
}))
const EditPanelContext = () => {
  return (
    <Menu id={EDITOR_PANEL_ID}>
      <Submenu label='创建组件节点'>
        {traggerCreators.map(item => (<Item key={item.type}>
          <div className='flex gap-3 items-center w-full'>
            <item.creator.icon className='w-5 h-5' />
            <span className='text-md'>{item.creator.label}</span>
          </div>
        </Item>))}
      </Submenu>
    </Menu>
  )
}

export default memo(EditPanelContext)
