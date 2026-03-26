import type { Socket } from 'socket.io-client'
import { useAgentWsConn } from './use-agent-ws-conn'
import { createContext } from 'react'

export const AgentWsConnContext = createContext<Socket | null>(null)

export const useAgentWsConnInstance = (connToken: string) => {
  return useAgentWsConn(connToken)
}
