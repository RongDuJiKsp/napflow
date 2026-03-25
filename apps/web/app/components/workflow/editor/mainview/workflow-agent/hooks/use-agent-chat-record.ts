import { useContext, useEffect, useState } from 'react'
import { AgentWsConnContext } from './use-agent-chat'
type AgentChatRecord = {
  id: string
} // TODO: define the type of chat record

export const useAgentChatRecord = () => {
  const conn = useContext(AgentWsConnContext)
  const [records, setRecords] = useState<AgentChatRecord[]>([])

  useEffect(() => {
    if (!conn) return

    const handleIncomingRecord = () => {
      setRecords([])
    }

    conn.on('chat-record', handleIncomingRecord)
    return () => {
      conn.off('chat-record', handleIncomingRecord)
    }
  }, [conn])

  return {
    hasRecords: records.length > 0,
    records,
  }
}
