import { Tag, Typography } from 'antd'
import { RiSparkling2Line } from '@remixicon/react'
import { useAgentChatStatus } from './hooks/use-agent-chat-status'

const AgentStatus = () => {
  const { isConnected } = useAgentChatStatus()

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500">
          <RiSparkling2Line size={18} />
          <Typography.Text className="text-sm text-gray-600!">
            Agent 对话
          </Typography.Text>
        </div>
        <Tag color={isConnected ? 'success' : 'default'}>
          {isConnected ? '已连接' : '连接中'}
        </Tag>
      </div>
      <Typography.Text className="text-xs text-black/45">
        使用Agent快速生成工作流
      </Typography.Text>
    </div>
  )
}

export default AgentStatus
