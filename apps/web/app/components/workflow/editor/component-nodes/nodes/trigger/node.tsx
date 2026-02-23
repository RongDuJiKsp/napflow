import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import { TriggerOn } from '@shared/common/workflow/node-data/trigger'
import type { TriggerData } from '@shared/common/workflow/node-data/trigger'
import InputWithEnv from '../../common/input-with-env'
import { useComponentNodeEnv } from '../../hooks/use-component-node-env'
import { noop } from 'lodash-es'

const TriggerNode: ComponentNodeFc<TriggerData> = ({ id, data }) => {
  const triggerLabel = data.on === TriggerOn.Friend ? '私聊触发' : '群聊触发'
  const targetId = data.on === TriggerOn.Friend ? data.userId : data.groupId
  const targetLabel = data.on === TriggerOn.Friend ? 'UID' : 'GID'
  const { vars } = useComponentNodeEnv(id)

  return (
    <div className="flex flex-col gap-1 relative min-w-40">
      <div className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">触发方式</span>
        <span className="truncate text-gray-600 max-w-28">{triggerLabel}</span>
      </div>
      <div className="flex flex-col gap-0.5 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">{targetLabel}</span>
        {targetId ? (
          <div className="max-h-8 overflow-hidden text-gray-500">
            <InputWithEnv
              envs={vars}
              value={targetId}
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
export default memo(TriggerNode)
