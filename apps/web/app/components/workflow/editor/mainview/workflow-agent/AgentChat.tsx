'use client'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import {
  AgentWsConnContext,
  useAgentWsConnInstance,
} from './hooks/use-agent-chat'
import AgentStatus from './AgentStatus'
import ChatInput from './ChatInput'
import ChatRecord from './ChatRecord'

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
      <div className="flex h-full flex-col gap-3">
        <AgentStatus />
        <ChatRecord />
        <ChatInput />
      </div>
    </AgentChatConnProvider>
  )
}

export default memo(AgentChat)
