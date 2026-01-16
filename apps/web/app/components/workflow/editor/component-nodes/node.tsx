import { memo } from 'react'
import { ComponentNodeCreatorMap } from './constants'
import type { WorkflowFc } from './types'
import { twMerge } from 'tailwind-merge'
import { Handle, Position } from '@xyflow/react'

const ComponentNodesNode: WorkflowFc<unknown> = ({ data, selected, dragging, ...extra }) => {
  const creator = ComponentNodeCreatorMap[data.type]
  return (
    <div className={twMerge(
      'flex items-center gap-3 px-4 py-3',
      'bg-linear-to-r from-purple-50 to-pink-50',
      'rounded-xl border border-pink-200',
      'shadow-sm transition-all duration-200',
      'hover:shadow-lg hover:border-purple-300',
      'hover:from-purple-100 hover:to-pink-100',
      selected && 'border-2 border-purple-500 shadow-md',
      dragging && 'opacity-60 cursor-grabbing',
    )}>
      <creator.icon className='h-4 w-4 text-purple-600'/>
      <span className='text-sm font-medium text-gray-900'>{data.title}</span>
      {
        data.expanded && (<div className='w-44 h-12 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl border border-pink-200'>
          {<creator.nodeComponent data={data as any} selected={selected} dragging={dragging} {...extra} />}
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
