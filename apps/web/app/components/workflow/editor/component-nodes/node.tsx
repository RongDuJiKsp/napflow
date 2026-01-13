import { memo } from 'react'
import { ComponentNodeCreatorMap } from './constants'
import type { WorkflowFc } from './types'

const ComponentNodesNode: WorkflowFc<unknown> = ({ data }) => {
  const creator = ComponentNodeCreatorMap[data.type]
  return (
    <div className='flex items-center gap-3'>
      <creator.icon className='h-4 w-4'/>
      <span>{data.title}</span>
    </div>
  )
}
export default memo(ComponentNodesNode)
