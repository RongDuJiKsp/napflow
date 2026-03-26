import { useContext, useEffect } from 'react'
import { AgentWsConnContext } from './use-agent-chat'
import { useUpdate } from 'ahooks'

export const useAgentChatStatus = () => {
  const conn = useContext(AgentWsConnContext)
  const forceUpdate = useUpdate()

  useEffect(() => {
    if (!conn) return

    conn.on('connect', forceUpdate)
    conn.on('disconnect', forceUpdate)

    return () => {
      conn.off('connect', forceUpdate)
      conn.off('disconnect', forceUpdate)
    }
  }, [conn, forceUpdate])

  return {
    isConnected: Boolean(conn?.connected),
  }
}
