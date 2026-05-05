import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { JsonReadData } from '@shared/common/workflow/node-data/json-read'

const JsonReadNode: ComponentNodeFc<JsonReadData> = ({ data }) => {
  return (
    <div className="flex flex-col gap-1 relative min-w-40">
      <div className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">来源变量</span>
        <span className="truncate text-gray-500 max-w-28">
          {data.sourceVarName || (
            <span className="text-gray-400 italic">未选择</span>
          )}
        </span>
      </div>
    </div>
  )
}

export default memo(JsonReadNode)
