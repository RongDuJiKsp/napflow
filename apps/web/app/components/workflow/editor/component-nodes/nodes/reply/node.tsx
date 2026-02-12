import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import { ReplyTarget } from '@shared/common/workflow/node-data/reply'
import type { ReplyData } from '@shared/common/workflow/node-data/reply'
import InputWithEnv from '../../common/input-with-env'
import { useComponentNodeEnv } from '../../hooks/use-component-node-env'
import { noop } from 'lodash-es'

const ReplyTargetLabels: Record<string, string> = {
  [ReplyTarget.User]: '指定用户',
  [ReplyTarget.Group]: '指定群组',
  [ReplyTarget.triggerSource]: '触发来源',
}

const ReplyNode: ComponentNodeFc<ReplyData> = ({ id, data }) => {
  const targetLabel = ReplyTargetLabels[data.replyTarget] || '未配置'
  const targetId
    = data.replyTarget === ReplyTarget.User
      ? data.userId
      : data.replyTarget === ReplyTarget.Group
        ? data.groupId
        : data.triggerSourceId
  const { vars } = useComponentNodeEnv(id)

  return (
    <div className="flex flex-col gap-1 relative min-w-40">
      <div className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">回复目标</span>
        <span className="truncate text-gray-600 max-w-28">{targetLabel}</span>
      </div>
      <div className="flex flex-col gap-0.5 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">
          {data.replyTarget === ReplyTarget.User
            ? 'UID'
            : data.replyTarget === ReplyTarget.Group
              ? 'GID'
              : 'TriggerID'}
        </span>
        {targetId
          ? (
            <div className="max-h-8 overflow-hidden text-gray-500">
              <InputWithEnv
                envs={vars}
                value={targetId}
                onChange={noop}
                isEditable={false}
                className={{
                  contentEditable: 'text-xs text-gray-500 leading-tight outline-none',
                }}
              />
            </div>
          )
          : (
            <span className="text-gray-400 italic">未配置</span>
          )}
      </div>
      <div className="flex flex-col gap-0.5 text-xs px-2 py-1 rounded bg-white/60 border border-pink-100">
        <span className="text-purple-500 font-medium">内容</span>
        {data.content
          ? (
            <div className="max-h-16 overflow-hidden text-gray-500">
              <InputWithEnv
                envs={vars}
                value={data.content}
                onChange={noop}
                isEditable={false}
                className={{
                  contentEditable: 'text-xs text-gray-500 leading-tight outline-none',
                }}
              />
            </div>
          )
          : (
            <span className="text-gray-400 italic">未填写内容</span>
          )}
      </div>
    </div>
  )
}
export default memo(ReplyNode)
