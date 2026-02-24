import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { LoopStartData } from '@shared/common/workflow/node-data/loop-start'

const LoopStartNode: ComponentNodeFc<LoopStartData> = ({ id, data }) => {
  return (
    <div className="flex flex-col gap-1 relative min-w-40">
      <div className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">循环起点</span>
      </div>
    </div>
  )
}
export default memo(LoopStartNode)
