import { useAgentChatRecord } from './hooks/use-agent-chat-record'

const ChatRecord = () => {
  const { hasRecords, records } = useAgentChatRecord()

  return (
    <div className="min-h-[220px] flex-1 overflow-auto rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
      {!hasRecords && (
        <div className="pt-8 text-center text-black/40">
          开始聊天
        </div>
      )}
      {records.map(record => (
        <div
          key={record.id}
          className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3"
        >
          {record.text}
        </div>
      ))}
    </div>
  )
}

export default ChatRecord
