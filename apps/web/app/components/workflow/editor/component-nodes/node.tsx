import type { MouseEvent } from 'react'
import { memo, useCallback } from 'react'
import { COMPONENT_NODE_PANEL_ID, ComponentNodeCreatorMap } from './constants'
import type { ComponentNodeFc } from './types'
import { twMerge } from 'tailwind-merge'
import { Handle, NodeResizer, Position } from '@xyflow/react'
import { useContextMenu } from 'react-contexify'
import ComponentNodeEnvProvider from './providers/ComponentNodeEnvProvider'

const ComponentNodesNodeCore: ComponentNodeFc<unknown> = (props) => {
  const { data, selected, dragging } = props
  const creator = ComponentNodeCreatorMap[data.type]
  const isContainer = !!creator.isContainer

  const { show } = useContextMenu({ id: COMPONENT_NODE_PANEL_ID })
  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      show({ event: e, props })
    },
    [show, props],
  )

  return (
    <div
      className={twMerge(
        isContainer && [
          'w-full h-full',
          'rounded-2xl border-2 border-dashed border-purple-300',
          'bg-purple-50/30',
          selected && 'border-purple-500 shadow-md bg-purple-50/50',
        ],
        !isContainer && [
          'px-4 py-3',
          'bg-linear-to-r from-purple-50 to-pink-50',
          'rounded-xl border border-pink-200',
          'hover:border-purple-300 hover:from-purple-100 hover:to-pink-100',
          selected && 'border-2 border-purple-500 shadow-md',
        ],
        'shadow-sm transition-all duration-200 hover:shadow-lg',
        dragging && 'opacity-60 cursor-grabbing',
      )}
      onContextMenu={handleContextMenu}
    >
      {/* 容器节点的 NodeResizer：允许拖拽调整大小 */}
      {isContainer && (
        <NodeResizer
          isVisible={selected}
          minWidth={500}
          minHeight={150}
          lineClassName="!border-purple-400"
          handleClassName="!w-2.5 !h-2.5 !bg-purple-400 !border-2 !border-white !rounded-sm"
        />
      )}
      {/* 头部：图标 + 标题 + expanded 配置 */}
      <div
        className={twMerge(
          'flex items-center gap-3',
          isContainer
            && 'justify-between px-4 py-2 bg-linear-to-r from-purple-100/80 to-pink-100/80 rounded-t-2xl border-b border-purple-200/60',
        )}
      >
        <div className="flex items-center gap-2">
          <creator.icon className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-900">
            {data.title}
          </span>
        </div>
        {/* 容器节点的 expanded 配置显示在头部右侧 */}
        {isContainer && data.expanded && (
          <div className="px-2 py-0.5 bg-white/60 rounded border border-pink-100">
            <creator.nodeComponent {...props} />
          </div>
        )}
      </div>

      {/* 普通节点的 expanded 配置显示在标题下方 */}
      {!isContainer && data.expanded && (
        <div className="w-52 mt-2 min-h-3 bg-linear-to-r from-purple-50 to-pink-50 rounded-md border border-pink-200 overflow-hidden p-1">
          <creator.nodeComponent {...props} />
        </div>
      )}

      {/* Handles */}
      {/* beforeCreate时没有托管给workflow 就不渲染handle */}
      {!data._beforeCreate
        && !!creator.prevNodes?.length
        && (isContainer || !creator.mutiPrevHandles) && (
        <Handle type="target" position={Position.Left} />
      )}
      {!data._beforeCreate
        && !!creator.nextNodes?.length
        && (isContainer || !creator.mutiNextHandles) && (
        <Handle type="source" position={Position.Right} />
      )}
    </div>
  )
}

const ComponentNodesNode: ComponentNodeFc<unknown> = (props) => {
  return (
    <ComponentNodeEnvProvider>
      <ComponentNodesNodeCore {...props} />
    </ComponentNodeEnvProvider>
  )
}
export default memo(ComponentNodesNode)
