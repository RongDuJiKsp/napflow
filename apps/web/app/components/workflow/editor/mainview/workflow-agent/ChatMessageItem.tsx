import type { BaseMessage } from '@langchain/core/messages'
import { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import { memo } from 'react'

type RoleUi = {
  label: string
  wrapperClassName: string
  bubbleClassName: string
  badgeClassName: string
}

const getRoleUi = (role: string): RoleUi => {
  if (role === 'human') {
    return {
      label: '我',
      wrapperClassName: 'items-end',
      bubbleClassName:
        'border-blue-200 bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-blue-200/70',
      badgeClassName: 'bg-blue-100 text-blue-700',
    }
  }

  if (role === 'ai') {
    return {
      label: 'Agent',
      wrapperClassName: 'items-start',
      bubbleClassName: 'border-slate-200 bg-white text-slate-700 shadow-slate-200/80',
      badgeClassName: 'bg-emerald-100 text-emerald-700',
    }
  }

  return {
    label: role.toUpperCase(),
    wrapperClassName: 'items-start',
    bubbleClassName: 'border-slate-200 bg-slate-100 text-slate-700 shadow-slate-200/80',
    badgeClassName: 'bg-slate-200 text-slate-700',
  }
}

const TextMessageBubble = ({ text, role }: {
  text: string
  role: string
}) => {
  const roleUi = getRoleUi(role)

  return (
    <div className={`mb-3 flex w-full ${roleUi.wrapperClassName}`}>
      <div className="max-w-[88%] sm:max-w-[82%]">
        <div className="mb-1 flex items-center gap-2 text-[11px]">
          <span className={`rounded-full px-2 py-0.5 font-medium ${roleUi.badgeClassName}`}>
            {roleUi.label}
          </span>
        </div>
        <div
          className={`rounded-2xl border px-3 py-2.5 text-sm leading-6 whitespace-pre-wrap wrap-break-word shadow-sm ${roleUi.bubbleClassName}`}
        >
          {text || ' '}
        </div>
      </div>
    </div>
  )
}

type MessageBubbleProps<M extends BaseMessage = BaseMessage> = {
  record: M
}

const HumanMessageItem = ({ record }: MessageBubbleProps<HumanMessage>) => {
  return <TextMessageBubble text={record.text} role="human" />
}

const AiMessageItem = ({ record }: MessageBubbleProps<AIMessage>) => {
  return <TextMessageBubble text={record.text} role="ai" />
}

const ToolMessageItem = ({ record }: MessageBubbleProps<ToolMessage>) => {
  return <TextMessageBubble text={record.text} role="tool" />
}

const UnknownMessageItem = ({ record }: MessageBubbleProps<BaseMessage>) => {
  return <TextMessageBubble text={record.text} role={record.type} />
}

const ChatMessageItem = ({ record }: MessageBubbleProps) => {
  if (HumanMessage.isInstance(record))
    return <HumanMessageItem record={record} />

  else if (AIMessage.isInstance(record))
    return <AiMessageItem record={record} />

  else if (ToolMessage.isInstance(record))
    return <ToolMessageItem record={record} />

  else return <UnknownMessageItem record={record} />
}

export default memo (ChatMessageItem)
