import { Button, Input } from 'antd'
import { RiSendPlane2Line } from '@remixicon/react'
import { useAgentChatStatus } from './hooks/use-agent-chat-status'
import { useAgentChatQuery } from './hooks/use-agent-chat-query'

const ChatInput = ({ onInterrupt }: { onInterrupt: () => void }) => {
  const { query, setQuery, submitQuery } = useAgentChatQuery()
  const { isConnected } = useAgentChatStatus()

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-xs">
      <Input.TextArea
        value={query}
        onChange={event => setQuery(event.target.value)}
        onPressEnter={(event) => {
          if (event.shiftKey) return
          event.preventDefault()
          submitQuery()
        }}
        autoSize={{ minRows: 3, maxRows: 6 }}
        placeholder="请输入要发送给 Agent 的 query，按 Enter 发送，Shift + Enter 换行"
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button onClick={onInterrupt} danger>
          中断会话
        </Button>
        <Button
          type="primary"
          icon={<RiSendPlane2Line size={16} />}
          onClick={submitQuery}
          disabled={!isConnected || !query.trim()}
        >
          发送 Query
        </Button>
      </div>
    </div>
  )
}

export default ChatInput
