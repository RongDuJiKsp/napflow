import type { Socket } from 'socket.io-client'
import { useAgentWsConn } from './use-agent-ws-conn'
import { createContext, useCallback } from 'react'

export const AgentWsConnContext = createContext<Socket | null>(null)

export const useAgentWsConnInstance = (connToken: string) => {
  const handleConnCreated = useCallback((conn: Socket) => {
// TODO: 连接创建成功后的处理逻辑，如事件监听等
  }, [])
  return useAgentWsConn(connToken, handleConnCreated)
}

export const useAgentChatRecord = () => {
// TODO: 实现 Agent 对话记录的相关逻辑，如发送消息、接收消息、维护对话状态等
}
