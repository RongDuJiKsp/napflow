import { useContext } from 'react'
import { AgentWsConnContext } from './use-agent-chat'
import { useAgentClientRPCImpl } from '../client-rpc/use-agent-client-rpc'

export const useAgentChatEditor = () => {
  const conn = useContext(AgentWsConnContext)
  useAgentClientRPCImpl(conn || undefined)
}
