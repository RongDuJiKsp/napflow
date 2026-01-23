import { memo } from 'react'
import { Item, Menu } from 'react-contexify'
import { COMPONENT_NODE_PANEL_ID } from '../../constants'
import { useComponentNodeContextMenu } from './hooks/use-component-node-context-menu'
import { RiDeleteBin2Line, RiExpandLeftRightLine } from '@remixicon/react'

const ComponentNodeContext = () => {
  const { handleFoldUnfoldItem, handleDeleteItem }
    = useComponentNodeContextMenu()

  return (
    <Menu id={COMPONENT_NODE_PANEL_ID}>
      <Item onClick={handleFoldUnfoldItem}>
        <div className="flex gap-2 items-center">
          <RiExpandLeftRightLine className="h-5 w-5" />
          <div>折叠/展开节点</div>
        </div>
      </Item>
      <Item onClick={handleDeleteItem} className="contexify-item-danger">
        <div className="flex gap-2 items-center">
          <RiDeleteBin2Line className="h-5 w-5" />
          <div>删除节点</div>
        </div>
      </Item>
    </Menu>
  )
}
export default memo(ComponentNodeContext)
