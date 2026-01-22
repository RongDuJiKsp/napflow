import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { ReplyData } from './creator'
import { ReplyTarget } from './creator'
import {
  Label,
  ListBox,
  Select,
} from '@heroui/react'
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
    <div className="flex flex-col gap-2">
      <Select
        value={data.replyTarget}
        onChange={v => handleReplyTargetChange(v as ReplyTarget)}
      >
        <Label className="text-purple-700">回复目标</Label>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id={ReplyTarget.User}>用户（使用uid）</ListBox.Item>
            <ListBox.Item id={ReplyTarget.Group}>群组（使用pid）</ListBox.Item>
            <ListBox.Item id={ReplyTarget.triggerSource}>触发源上下文（使用triggerid）</ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      {data.replyTarget === ReplyTarget.User && (
        <div className="flex flex-col gap-1">
          <Label className="text-purple-700">目标uid</Label>
          <InputWithEnv
            envs={vars}
            value={data.userId || ''}
            onChange={handleUserIdChange}
            className={{
              contentEditable: 'text-md border border-purple-500 rounded-sm focus:border-purple-700 p-2',
              placeHolder: 'text-pink-200',
            }}
          />
        </div>
      )}

      {data.replyTarget === ReplyTarget.Group && (
        <div className="flex flex-col gap-1">
          <Label className="text-purple-700">目标pid</Label>
          <InputWithEnv
            envs={vars}
            value={data.groupId || ''}
            onChange={handleGroupIdChange}
            className={{
              contentEditable: 'text-md  border border-purple-500 rounded-sm focus:border-purple-700 p-2',
              placeHolder: 'text-pink-200',
            }}
          />
        </div>
      )}

      {data.replyTarget === ReplyTarget.triggerSource && (
        <div className="flex flex-col gap-2">
          <Label className="text-purple-700">目标triggerid</Label>
          <InputWithEnv
            envs={vars}
            value={data.triggerSourceId || ''}
            onChange={handleTriggerSourceIdChange}
            placeholder='触发器id，通常在触发器变量的trigger.triggerId'
            className={{
              contentEditable: 'text-md border border-purple-500 rounded-sm focus:border-purple-700 p-2',
              placeHolder: 'text-pink-200',
            }}
          />
        </div>
      )}

      <div className="border-b border-pink-200 py-2" />

      <div className="flex flex-col gap-2">
        <Label className="text-purple-700">回复内容</Label>
        <InputWithEnv
          className={{
            contentEditable: 'text-md min-h-30 border border-purple-500 rounded-sm focus:border-purple-700 p-2',
            placeHolder: 'text-pink-200',
          }}
          envs={vars}
          value={data.content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  )
}

export default memo(ReplyPanel)
