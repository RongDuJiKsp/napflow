import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { ReplyData } from '@shared/common/workflow/node-data/reply'
import { ReplyTarget } from '@shared/common/workflow/node-data/reply'
import { Label, ListBox, Select } from '@heroui/react'
import InputWithEnv from '../../common/input-with-env'
import { useReplyCurd } from './hooks/use-reply-curd'

const ReplyPanel: ComponentPanelFc<ReplyData> = ({ id, data }) => {
  const {
    vars,
    handleReplyTargetChange,
    handleGroupIdChange,
    handleTriggerSourceIdChange,
    handleUserIdChange,
    handleContentChange,
  } = useReplyCurd(id)

  return (
    <div className="flex flex-col gap-3">
      {/* ─── 回复目标选择 ─── */}
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            目标类型
          </Label>
          <Select
            value={data.replyTarget}
            onChange={v => handleReplyTargetChange(v as ReplyTarget)}
          >
            <Select.Trigger className="border-purple-200 hover:border-purple-400 transition-colors rounded-lg">
              <Select.Value />
            </Select.Trigger>
            <Select.Popover className="min-w-56">
              <ListBox>
                <ListBox.Item id={ReplyTarget.User} className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors">
                  <span className="text-sm">🧑 用户（使用 UID）</span>
                </ListBox.Item>
                <ListBox.Item id={ReplyTarget.Group} className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors">
                  <span className="text-sm">👥 群组（使用 PID）</span>
                </ListBox.Item>
                <ListBox.Item id={ReplyTarget.triggerSource} className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors">
                  <span className="text-sm">🔗 触发源上下文（使用 TriggerID）</span>
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {/* ─── 用户目标参数 ─── */}
      {data.replyTarget === ReplyTarget.User && (
        <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <Label className="text-purple-600 text-xs font-semibold tracking-wide">
              目标 UID
            </Label>
            <InputWithEnv
              envs={vars}
              value={data.userId || ''}
              onChange={handleUserIdChange}
              placeholder="输入用户ID，输入 $ 引用变量"
              className={{
                contentEditable:
                  'text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
                placeHolder: 'text-gray-300',
              }}
            />
          </div>
        </div>
      )}

      {/* ─── 群组目标参数 ─── */}
      {data.replyTarget === ReplyTarget.Group && (
        <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <Label className="text-purple-600 text-xs font-semibold tracking-wide">
              目标 PID
            </Label>
            <InputWithEnv
              envs={vars}
              value={data.groupId || ''}
              onChange={handleGroupIdChange}
              placeholder="输入群组ID，输入 $ 引用变量"
              className={{
                contentEditable:
                  'text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
                placeHolder: 'text-gray-300',
              }}
            />
          </div>
        </div>
      )}

      {/* ─── 触发源目标参数 ─── */}
      {data.replyTarget === ReplyTarget.triggerSource && (
        <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <Label className="text-purple-600 text-xs font-semibold tracking-wide">
              目标 TriggerID
            </Label>
            <InputWithEnv
              envs={vars}
              value={data.triggerSourceId || ''}
              onChange={handleTriggerSourceIdChange}
              placeholder="触发器ID，通常在触发器变量的 trigger.triggerId"
              className={{
                contentEditable:
                  'text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
                placeHolder: 'text-gray-300',
              }}
            />
          </div>
        </div>
      )}

      {/* ─── 回复内容 ─── */}
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            消息内容
          </Label>
          <InputWithEnv
            className={{
              contentEditable:
                'text-sm min-h-30 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
              placeHolder: 'text-gray-300',
            }}
            envs={vars}
            value={data.content}
            onChange={handleContentChange}
            placeholder="输入回复内容，输入 $ 引用变量"
          />
        </div>
      </div>
    </div>
  )
}

export default memo(ReplyPanel)
