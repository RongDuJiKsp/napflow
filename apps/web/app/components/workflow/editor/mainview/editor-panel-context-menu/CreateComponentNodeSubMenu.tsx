import { memo } from 'react'
import { Item, Submenu } from 'react-contexify'
import { ComponentNodeCreatorMap } from '../../component-nodes/constants'
import type { ComponentNodesEnum } from '../../component-nodes/types'
import { useStickyNewComponentNode } from '../../hooks/use-create-component-node'
const traggerCreators = Object.entries(ComponentNodeCreatorMap).map(([key, value]) => ({
  type: key as ComponentNodesEnum,
  creator: value,
}))
const CreateComponentNodeSubMenu = () => {
  const { createAndSticky } = useStickyNewComponentNode()
  return (
    <Submenu label='创建组件节点'>
      {traggerCreators.map(item => (<Item key={item.type} onClick={() => createAndSticky(item.type)}>
        <div className='flex gap-3 items-center w-full'>
          <item.creator.icon className='w-5 h-5' />
          <span className='text-md'>{item.creator.label}</span>
        </div>
      </Item>))}
    </Submenu>
  )
}
export default memo(CreateComponentNodeSubMenu)
