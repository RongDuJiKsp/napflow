import { useEffect, useRef } from 'react'
import { useAgentChatRecord } from './hooks/use-agent-chat-record'
import ChatMessageItem from './ChatMessageItem'

const ChatRecord = () => {
  const { hasRecords, records } = useAgentChatRecord()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollAreaRef.current) return
    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
  }, [records.length])

  return (
    <div
      ref={scrollAreaRef}
      className="min-h-[220px] flex-1 overflow-auto rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 via-white to-slate-50 p-4 shadow-inner"
    >
      {!hasRecords && (
        <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 text-center text-sm text-slate-500">
          <div>
            <div className="text-base font-medium text-slate-700">开始聊天</div>
            <div className="mt-1 text-xs">发送 query 后，这里会展示你和 Agent 的对话记录。</div>
          </div>
        </div>
      )}
      {records.map(record => (
        <ChatMessageItem
          key={record.id}
          record={record}
        />
      ))}
    </div>
  )
}

export default ChatRecord
