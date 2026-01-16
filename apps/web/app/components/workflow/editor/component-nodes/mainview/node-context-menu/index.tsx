import { memo } from 'react'
import { Item, Menu } from 'react-contexify'
import { COMPONENT_NODE_PANEL_ID } from '../../constants'
import { useComponentNodeContextMenu } from './hooks/use-component-node-context-menu'

const ComponentNodeContext = () => {
  const { handleDeleteItem } = useComponentNodeContextMenu()

  return (
    <Menu id={COMPONENT_NODE_PANEL_ID}>
      <Item onClick={handleDeleteItem}>
        <div className='text-danger'>删除节点</div>
      </Item>
    </Menu>
  )
}
export default memo(ComponentNodeContext)
