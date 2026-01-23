import { Button } from '@heroui/react'
import { RiSendPlaneLine } from '@remixicon/react'
import { memo } from 'react'

const PublsihDraft = () => {
  return (
    <div className="absolute right-0 top-0 mt-3 mr-6 z-10">
      <Button >
        <div className='flex items-center gap-3 px-2'>
          <span>发布工作流为插件</span>
          <RiSendPlaneLine size={16} />
        </div>
      </Button>
    </div>
  )
}
export default memo(PublsihDraft)
