import { md5Fn } from '@/utils/tools'
import { isEqual } from 'lodash-es'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import React from 'react'

const WorkflowSideMenus = ({ elements, children}: PropsWithChildren<{ elements?: React.FC[] }>) => {
  return <div className='relative'>
    {children}
    <div className='absolute right-0 top-0 mt-3 mr-6 z-10'>
      <div className='flex gap-3'>
        {elements?.map(Element => (<Element key={md5Fn(Element)}/>))}
      </div>
    </div>
  </div>
}

export default memo(WorkflowSideMenus, (prevProps, nextProps) =>
  prevProps.children === nextProps.children && isEqual(prevProps.elements, nextProps.elements),
)
