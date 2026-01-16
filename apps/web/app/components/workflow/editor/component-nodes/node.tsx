import type { MouseEvent } from 'react'
import { memo, useCallback } from 'react'
import { COMPONENT_NODE_PANEL_ID, ComponentNodeCreatorMap } from './constants'
import type { ComponentNodeFc } from './types'
import { twMerge } from 'tailwind-merge'
import { Handle, Position } from '@xyflow/react'
import { useContextMenu } from 'react-contexify'

const ComponentNodesNode: ComponentNodeFc<unknown> = (props) => {
  const { data, selected, dragging } = props
  const creator = ComponentNodeCreatorMap[data.type]
  // NodeContextMenu
  const { show } = useContextMenu({ id: COMPONENT_NODE_PANEL_ID })
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    show({ event: e, props })
  }, [show, props])

  return (
    <div className={twMerge(
      ' px-4 py-3',
      'bg-linear-to-r from-purple-50 to-pink-50',
      'rounded-xl border border-pink-200',
      'shadow-sm transition-all duration-200',
      'hover:shadow-lg hover:border-purple-300',
      'hover:from-purple-100 hover:to-pink-100',
      selected && 'border-2 border-purple-500 shadow-md',
      dragging && 'opacity-60 cursor-grabbing',
    )}
    onContextMenu={handleContextMenu}>
      <div className='flex items-center gap-3'>
        <creator.icon className='h-4 w-4 text-purple-600'/>
        <span className='text-sm font-medium text-gray-900'>{data.title}</span>
      </div>
      {
        data.expanded && (<div className='w-44 mt-2 min-h-3  bg-linear-to-r from-purple-50 to-pink-50 rounded-md border border-pink-200 overflow-hidden p-1'>
          {<creator.nodeComponent {...props} />}
        </div>)
      }
      {
        !!creator.prevNodes?.length && (<>
          <Handle type="target" position={Position.Left} />
        </>)
      }
      {
        !!creator.nextNodes?.length && (<>
          <Handle type="source" position={Position.Right} />
        </>)
      }
    </div>
  )
}
export default memo(ComponentNodesNode)
