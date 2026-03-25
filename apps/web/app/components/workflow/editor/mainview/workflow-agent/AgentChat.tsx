'use client'
import { Typography } from 'antd'
import { RiSparkling2Line } from '@remixicon/react'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import {
  AgentWsConnContext,
  useAgentWsConnInstance,
} from './hooks/use-agent-chat'

const AgentChatConnProvider = ({
  connToken,
  children,
}: PropsWithChildren<{ connToken: string }>) => {
  const conn = useAgentWsConnInstance(connToken)
  return (
    <AgentWsConnContext.Provider value={conn}>
      {children}
    </AgentWsConnContext.Provider>
  )
}

const AgentChat = ({ connToken }: { connToken: string }) => {
  return (
    <AgentChatConnProvider connToken={connToken}>
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center">
        <div className="mb-3 flex justify-center text-gray-400">
          <RiSparkling2Line size={24} />
        </div>
        <Typography.Title level={5} className="m-0! text-gray-700!">
          Agent 对话即将上线
        </Typography.Title>
        <Typography.Text className="mt-2 block text-sm text-black/45">
          你已完成模型选择。下一步将支持与 Agent 的实时多轮对话。
        </Typography.Text>
      </div>
    </AgentChatConnProvider>
  )
}

export default memo(AgentChat)
