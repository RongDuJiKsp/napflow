import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { LoopData } from '@shared/common/workflow/node-data/loop'

const LoopNode: ComponentNodeFc<LoopData> = ({ id, data }) => {
  return (
    <div className="flex flex-col gap-1 relative min-w-40">
      <div className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">循环次数</span>
        <span className="truncate text-gray-600 max-w-28">
          {data.maxCount ?? '未配置'}
        </span>
      </div>
    </div>
  )
}
export default memo(LoopNode)
