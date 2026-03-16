import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { TimerData } from '@shared/common/workflow/node-data/timer'
import InputWithEnv from '../../common/input-with-env'
import { useComponentNodeEnv } from '../../hooks/use-component-node-env'
import { noop } from 'lodash-es'

const TimerNode: ComponentNodeFc<TimerData> = ({ id, data }) => {
  const { vars } = useComponentNodeEnv(id)

  return (
    <div className="flex flex-col gap-1 relative min-w-40">
      <div className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">触发方式</span>
        <span className="truncate text-gray-600 max-w-28">定时触发</span>
      </div>
      <div className="flex flex-col gap-0.5 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">时间表达式</span>
        {data.timeExpr ? (
          <div className="max-h-8 overflow-hidden text-gray-500">
            <InputWithEnv
              envs={vars}
              value={data.timeExpr}
              onChange={noop}
              isEditable={false}
              className={{
                contentEditable:
                  'text-xs text-gray-500 leading-tight outline-none',
              }}
            />
          </div>
        ) : (
          <span className="text-gray-400 italic">未配置</span>
        )}
      </div>
    </div>
  )
}

export default memo(TimerNode)
