import { memo, useCallback } from 'react'
import type { ItemParams } from 'react-contexify'
import { Item, Menu, Submenu } from 'react-contexify'
import {
  COMPONENT_NODE_PANEL_ID,
  ComponentNodeCreatorMap,
} from '../../constants'
import { useComponentNodeContextMenu } from './hooks/use-component-node-context-menu'
import {
  RiAddLine,
  RiDeleteBin2Line,
  RiExpandLeftRightLine,
} from '@remixicon/react'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { useNorReturnFn } from '@/app/hooks/utils/use-callbacker'
import { useLoopNodeOperator } from '../../nodes/loop/hooks/use-loop-operator'
import { useIterateNodeOperator } from '../../nodes/iterate/hooks/use-iterate-operator'

type ContextMenuProps = ItemParams<{ id: string }>

// loop 内部可添加的节点类型（排除 loop-start 和 trigger）
const loopAddableNodeTypes = Object.entries(ComponentNodeCreatorMap)
  .filter(([key]) => {
    const k = key as ComponentNodesEnum
    return ![
      ComponentNodesEnum.LoopStart,
      ComponentNodesEnum.IterateStart,
      ComponentNodesEnum.Trigger,
      ComponentNodesEnum.Loop,
      ComponentNodesEnum.Iterate,
    ].includes(k)
  })
  .map(([key, value]) => ({
    type: key as ComponentNodesEnum,
    creator: value,
  }))

const ComponentNodeContext = () => {
  const { handleFoldUnfoldItem, handleDeleteItem, isContainerNode }
    = useComponentNodeContextMenu()

  const { handleAddNodeToLoop } = useLoopNodeOperator()
  const { handleAddNodeToIterate } = useIterateNodeOperator()

  const hiddenLoopNode = useNorReturnFn(isContainerNode)

  const getContextHandler = useCallback(
    (contextEnum: ComponentNodesEnum) => {
      return ({ props }: ContextMenuProps) => {
        if (!props?.id) return
        const containerType = props.data?.data.type as ComponentNodesEnum
        if (containerType === ComponentNodesEnum.Loop)
          handleAddNodeToLoop(props.id, contextEnum)
        else if (containerType === ComponentNodesEnum.Iterate)
          handleAddNodeToIterate(props.id, contextEnum)
      }
    },
    [handleAddNodeToIterate, handleAddNodeToLoop],
  )
  return (
    <Menu id={COMPONENT_NODE_PANEL_ID}>
      <Item onClick={handleFoldUnfoldItem}>
        <div className="flex gap-2 items-center">
          <RiExpandLeftRightLine className="h-5 w-5" />
          <div>折叠/展开节点</div>
        </div>
      </Item>
      {/* 仅 loop 节点显示：添加子节点 */}
      <Submenu
        label={
          <div className="flex gap-2 items-center">
            <RiAddLine className="h-5 w-5" />
            <div>添加节点</div>
          </div>
        }
        hidden={hiddenLoopNode}
      >
        {loopAddableNodeTypes.map(item => (
          <Item key={item.type} onClick={getContextHandler(item.type)}>
            <div className="flex gap-3 items-center w-full">
              <item.creator.icon className="w-5 h-5" />
              <span className="text-md">{item.creator.label}</span>
            </div>
          </Item>
        ))}
      </Submenu>
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
